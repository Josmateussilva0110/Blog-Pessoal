import { PASSWORD_RESET_PENDING_STATUS, USER_PROFILE_SELECT } from "../constants/users"
import {
    createEphemeralAuthClient,
    createSupabaseClientForUser,
    supabaseAdmin,
    supabaseAuth,
} from "../database/supabase/supabase"
import type { ChangePasswordDTO } from "../schemas/auth/changePassword"
import type { LoginDTO } from "../schemas/auth/login"
import type { PasswordResetRequestDTO } from "../schemas/auth/passwordResetRequest"
import type { UpdateProfileDTO } from "../schemas/users/updateProfile"
import type { AuthSession, AuthTokens } from "../types/auth"
import type { CreatedId } from "../types/common/serviceResult"
import type {
    PasswordChangeProfile,
    ProfileImageFile,
    PublicProfileImageMeta,
    UserProfile,
    UserResult,
} from "../types/users"
import { UserErrorCode } from "../types/users/errorCode"
import { resolveActiveUserId } from "../utils/auth/accessToken"
import { isRefreshTokenReuseOrRevoked, mapPasswordUpdateError } from "../utils/auth/authErrors"
import { buildAuthTokens } from "../utils/auth/authSession"
import { isAdminUser } from "../utils/auth/isAdminUser"
import { revokeAccessToken, revokeUserSessions } from "../utils/auth/tokenRevocation"
import {
    deleteProfileImageFromStorage,
    getProfileImagePublicUrl,
    getProfileThumbnailPublicUrl,
    uploadProfileImageToStorage,
} from "../utils/users/profileImageStorage"
import { mapUserProfileRow } from "../utils/users/userProfile"

class UserService {
    async login({ email, password }: LoginDTO): Promise<UserResult<AuthSession>> {
        try {
            const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })

            // Conta que não é o admin recebe a mesma resposta de credencial inválida
            // (não revela que a conta existe) e os tokens emitidos nunca saem daqui
            if (error || !data.session || !data.user || !isAdminUser(data.user.id)) {
                return { status: false, error: { code: UserErrorCode.INVALID_CREDENTIALS } }
            }

            return { status: true, data: await this.buildSession(buildAuthTokens(data.session, data.user)) }
        } catch (error) {
            console.error("[UserService.login] error:", error)
            return { status: false, error: { code: UserErrorCode.LOGIN_FAILED } }
        }
    }

    /** Só renova os tokens (usado pelo authMiddleware, que não precisa do perfil) */
    async renewTokens(refreshToken: string): Promise<UserResult<AuthTokens>> {
        try {
            const { data, error } = await supabaseAuth.auth.refreshSession({ refresh_token: refreshToken })

            if (error || !data.session || !data.user) {
                const code = isRefreshTokenReuseOrRevoked(error)
                    ? UserErrorCode.SESSION_REVOKED
                    : UserErrorCode.SESSION_EXPIRED
                return { status: false, error: { code } }
            }

            return { status: true, data: buildAuthTokens(data.session, data.user) }
        } catch (error) {
            console.error("[UserService.renewTokens] error:", error)
            return { status: false, error: { code: UserErrorCode.LOGIN_FAILED, message: "Erro ao renovar sessão." } }
        }
    }

    async refresh(refreshToken: string): Promise<UserResult<AuthSession>> {
        const renewed = await this.renewTokens(refreshToken)
        if (!renewed.status) return renewed

        return { status: true, data: await this.buildSession(renewed.data) }
    }

    async logout(accessToken: string): Promise<UserResult<null>> {
        try {
            const userId = await resolveActiveUserId(accessToken)
            if (!userId) return { status: false, error: { code: UserErrorCode.LOGOUT_FAILED } }

            const { error } = await supabaseAdmin.auth.admin.signOut(userId, "global")

            if (error) {
                console.error("[UserService.logout]", error)
                return { status: false, error: { code: UserErrorCode.LOGOUT_FAILED } }
            }

            await Promise.all([revokeAccessToken(accessToken), revokeUserSessions(userId)])

            return { status: true, data: null }
        } catch (error) {
            console.error("[UserService.logout] error:", error)
            return { status: false, error: { code: UserErrorCode.LOGOUT_FAILED } }
        }
    }

    async getProfile(userId: string): Promise<UserResult<UserProfile>> {
        try {
            const { data, error } = await createSupabaseClientForUser(userId)
                .from("users")
                .select(USER_PROFILE_SELECT)
                .eq("id", userId)
                .maybeSingle()

            if (error) {
                console.error("[UserService.getProfile]", error)
                return { status: false, error: { code: UserErrorCode.USER_FETCH_FAILED } }
            }

            if (!data) return { status: false, error: { code: UserErrorCode.USER_NOT_FOUND } }

            return { status: true, data: mapUserProfileRow(data) }
        } catch (error) {
            console.error("[UserService.getProfile] error:", error)
            return { status: false, error: { code: UserErrorCode.USER_FETCH_FAILED } }
        }
    }

    async updateProfile(userId: string, { username }: UpdateProfileDTO): Promise<UserResult<CreatedId>> {
        try {
            const { data, error } = await createSupabaseClientForUser(userId)
                .from("users")
                .update({ username })
                .eq("id", userId)
                .select("id")
                .single()

            if (error || !data) {
                console.error("[UserService.updateProfile]", error)
                return { status: false, error: { code: UserErrorCode.USER_UPDATE_FAILED } }
            }

            return { status: true, data: { id: data.id } }
        } catch (error) {
            console.error("[UserService.updateProfile] error:", error)
            return { status: false, error: { code: UserErrorCode.USER_UPDATE_FAILED } }
        }
    }

    async changePassword(userId: string, payload: ChangePasswordDTO): Promise<UserResult<null>> {
        try {
            const profile = await this.fetchProfileForPasswordChange(userId)
            if (!profile.status) return profile

            if (profile.data.must_change_password === true) {
                const changed = await this.changePasswordWithAdmin(userId, payload.new_password)
                if (!changed.status) return changed

                await this.clearMustChangePasswordFlag(userId)
                return changed
            }

            // Fora da troca obrigatória, a senha atual é exigida
            if (!payload.current_password) {
                return { status: false, error: { code: UserErrorCode.INVALID_PASSWORD } }
            }

            return this.changePasswordWithReauth(profile.data.email, payload.current_password, payload.new_password)
        } catch (error) {
            console.error("[UserService.changePassword] error:", error)
            return {
                status: false,
                error: { code: UserErrorCode.USER_UPDATE_FAILED, message: "Não foi possível atualizar a senha." },
            }
        }
    }

    async requestPasswordReset({ identifier }: PasswordResetRequestDTO): Promise<UserResult<null>> {
        try {
            const { data: userRow, error: lookupError } = await supabaseAdmin
                .from("users")
                .select("id")
                .eq("email", identifier)
                .maybeSingle()

            if (lookupError) {
                console.error("[UserService.requestPasswordReset] lookup failed:", lookupError)
                return { status: false, error: { code: UserErrorCode.PASSWORD_RESET_REQUEST_FAILED } }
            }

            // E-mail desconhecido recebe a mesma resposta, para não revelar quais contas existem
            if (!userRow) return { status: true, data: null }

            const { error: insertError } = await supabaseAdmin
                .from("password_reset_requests")
                .insert({ user_id: userRow.id, identifier, status: PASSWORD_RESET_PENDING_STATUS })

            if (insertError) {
                console.error("[UserService.requestPasswordReset] insert failed:", insertError)
                return { status: false, error: { code: UserErrorCode.PASSWORD_RESET_REQUEST_FAILED } }
            }

            return { status: true, data: null }
        } catch (error) {
            console.error("[UserService.requestPasswordReset] error:", error)
            return { status: false, error: { code: UserErrorCode.PASSWORD_RESET_REQUEST_FAILED } }
        }
    }

    async updateProfileImage(userId: string, file: ProfileImageFile): Promise<UserResult<CreatedId>> {
        try {
            if (!file.buffer.length) {
                return {
                    status: false,
                    error: { code: UserErrorCode.PROFILE_IMAGE_INVALID, message: "Arquivo de imagem vazio." },
                }
            }

            const [previousImagePath, storagePath] = await Promise.all([
                this.fetchCurrentProfileImagePath(userId),
                uploadProfileImageToStorage(userId, file.buffer),
            ])

            const updated = await this.saveProfileImagePath(userId, storagePath)
            if (!updated.status) {
                await this.removeStoredProfileImage(storagePath, "updateProfileImage rollback")
                return updated
            }

            if (previousImagePath && previousImagePath !== storagePath) {
                await this.removeStoredProfileImage(previousImagePath, "updateProfileImage")
            }

            return updated
        } catch (error) {
            console.error("[UserService.updateProfileImage] error:", error)
            return {
                status: false,
                error: { code: UserErrorCode.USER_UPDATE_FAILED, message: "Erro ao salvar a foto de perfil." },
            }
        }
    }

    async deleteProfileImage(userId: string): Promise<UserResult<null>> {
        try {
            const previousImagePath = await this.fetchCurrentProfileImagePath(userId)
            const updated = await this.saveProfileImagePath(userId, null)
            if (!updated.status) return updated

            if (previousImagePath) {
                await this.removeStoredProfileImage(previousImagePath, "deleteProfileImage")
            }

            return { status: true, data: null }
        } catch (error) {
            console.error("[UserService.deleteProfileImage] error:", error)
            return {
                status: false,
                error: { code: UserErrorCode.USER_UPDATE_FAILED, message: "Erro ao remover a foto de perfil." },
            }
        }
    }

    async getPublicProfileImageMeta(): Promise<UserResult<PublicProfileImageMeta>> {
        try {
            // Rota pública, sem sessão: o cliente administrativo é o único que lê aqui
            const { data, error } = await supabaseAdmin
                .from("users")
                .select("profile_image_url, profile_image_updated_at")
                .not("profile_image_url", "is", null)
                .order("profile_image_updated_at", { ascending: false })
                .limit(1)
                .maybeSingle()

            if (error) {
                console.error("[UserService.getPublicProfileImageMeta]", error)
                return {
                    status: false,
                    error: { code: UserErrorCode.USER_FETCH_FAILED, message: "Erro ao buscar foto de perfil." },
                }
            }

            if (!data?.profile_image_url) {
                return { status: true, data: { updated_at: null, image_url: null, thumbnail_url: null } }
            }

            return {
                status: true,
                data: {
                    updated_at: data.profile_image_updated_at,
                    image_url: getProfileImagePublicUrl(data.profile_image_url, data.profile_image_updated_at),
                    thumbnail_url: getProfileThumbnailPublicUrl(data.profile_image_url, data.profile_image_updated_at),
                },
            }
        } catch (error) {
            console.error("[UserService.getPublicProfileImageMeta] error:", error)
            return {
                status: false,
                error: { code: UserErrorCode.USER_FETCH_FAILED, message: "Erro ao buscar foto de perfil." },
            }
        }
    }

    async getPublicProfileImageUrl(): Promise<UserResult<string>> {
        const meta = await this.getPublicProfileImageMeta()
        if (!meta.status) return meta

        if (!meta.data.image_url) {
            return { status: false, error: { code: UserErrorCode.PROFILE_IMAGE_NOT_FOUND } }
        }

        return { status: true, data: meta.data.image_url }
    }

    /** Perfil junto dos tokens; se a leitura falhar, a sessão vale do mesmo jeito */
    private async buildSession(tokens: AuthTokens): Promise<AuthSession> {
        const profile = await this.getProfile(tokens.user.id)
        return { tokens, user: profile.status ? profile.data : null }
    }

    private async fetchProfileForPasswordChange(userId: string): Promise<UserResult<PasswordChangeProfile>> {
        const { data, error } = await createSupabaseClientForUser(userId)
            .from("users")
            .select("email, must_change_password")
            .eq("id", userId)
            .maybeSingle()

        if (error) {
            console.error("[UserService.fetchProfileForPasswordChange]", error)
            return { status: false, error: { code: UserErrorCode.USER_FETCH_FAILED } }
        }

        if (!data) return { status: false, error: { code: UserErrorCode.USER_NOT_FOUND } }

        return { status: true, data }
    }

    private async changePasswordWithReauth(
        email: string,
        currentPassword: string,
        newPassword: string
    ): Promise<UserResult<null>> {
        const authClient = createEphemeralAuthClient()

        const { data: reauthData, error: reauthError } = await authClient.auth.signInWithPassword({
            email,
            password: currentPassword,
        })

        if (reauthError || !reauthData.session) {
            return {
                status: false,
                error: { code: UserErrorCode.INVALID_CREDENTIALS, message: "Senha atual incorreta." },
            }
        }

        const { error: updateError } = await authClient.auth.updateUser({ password: newPassword })

        if (updateError) {
            console.error("[UserService.changePasswordWithReauth]", updateError)
            return {
                status: false,
                error: { code: UserErrorCode.USER_UPDATE_FAILED, message: mapPasswordUpdateError(updateError.message) },
            }
        }

        return { status: true, data: null }
    }

    private async changePasswordWithAdmin(userId: string, newPassword: string): Promise<UserResult<null>> {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword })

        if (error) {
            console.error("[UserService.changePasswordWithAdmin]", error)
            return {
                status: false,
                error: { code: UserErrorCode.USER_UPDATE_FAILED, message: mapPasswordUpdateError(error.message) },
            }
        }

        return { status: true, data: null }
    }

    private async clearMustChangePasswordFlag(userId: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from("users")
            .update({ must_change_password: false })
            .eq("id", userId)

        if (error) {
            console.error("[UserService.clearMustChangePasswordFlag]", error)
        }
    }

    private async fetchCurrentProfileImagePath(userId: string): Promise<string | null> {
        const { data, error } = await createSupabaseClientForUser(userId)
            .from("users")
            .select("profile_image_url")
            .eq("id", userId)
            .maybeSingle()

        if (error) {
            console.error("[UserService.fetchCurrentProfileImagePath]", error)
            return null
        }

        return data?.profile_image_url ?? null
    }

    /** Grava (ou limpa, com null) o caminho da foto no perfil */
    private async saveProfileImagePath(userId: string, storagePath: string | null): Promise<UserResult<CreatedId>> {
        const now = new Date().toISOString()

        const { data, error } = await createSupabaseClientForUser(userId)
            .from("users")
            .update({
                profile_image_url: storagePath,
                profile_image_updated_at: storagePath ? now : null,
                updated_at: now,
            })
            .eq("id", userId)
            .select("id")
            .single()

        if (error || !data) {
            console.error("[UserService.saveProfileImagePath]", error)
            return {
                status: false,
                error: { code: UserErrorCode.USER_UPDATE_FAILED, message: "Não foi possível salvar a foto de perfil." },
            }
        }

        return { status: true, data: { id: data.id } }
    }

    private async removeStoredProfileImage(storagePath: string, context: string): Promise<void> {
        await deleteProfileImageFromStorage(storagePath).catch((error: unknown) => {
            console.error(`[UserService.${context}] storage cleanup failed:`, error)
        })
    }
}

export default new UserService()
