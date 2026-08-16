import { supabaseAuth, supabaseAdmin, createSupabaseClientForUser, createEphemeralAuthClient } from "../database/supabase/supabase"
import { USER_PROFILE_SELECT } from "../constants/user.constants"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { UserErrorCode } from "../types/code/userCode"
import { AuthTokens } from "../types/auth/auth.types"
import { UserProfile } from "../types/users/profile"
import { ChangePasswordDTO } from "../schemas/changePasswordSchema"
import { PasswordResetRequestDTO } from "../schemas/passwordResetRequestSchema"
import { getUserIdFromAccessToken } from "../utils/accessToken"
import { isRefreshTokenReuseOrRevoked, mapPasswordUpdateError } from "../utils/authErrors"
import { buildAuthTokens } from "../utils/authSession"
import { mapUserProfileRow } from "../utils/userProfile"
import { revokeAccessToken, revokeUserSessions } from "../utils/tokenRevocation"
import {
  deleteProfileImageFromStorage,
  getProfileImagePublicUrl,
  uploadProfileImageToStorage,
} from "../utils/profileImageStorage"

class UserService {
    async login(email: string, password: string): Promise<ServiceResult<AuthTokens, UserErrorCode>> {
        try {
            const { data, error } = await supabaseAuth.auth.signInWithPassword({
                email,
                password,
            })

            if (error || !data.session || !data.user) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.INVALID_CREDENTIALS,
                        message: "Email ou senha incorreto",
                    },
                }
            }

            return {
                status: true,
                data: buildAuthTokens(data.session, data.user),
            }
        } catch (error) {
            console.error("[UserService.login] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.LOGIN_FAILED,
                    message: "Erro ao fazer login",
                },
            }
        }
    }

    async logout(accessToken: string): Promise<ServiceResult<null, UserErrorCode>> {
        try {
            const userId = getUserIdFromAccessToken(accessToken)

            if (!userId) {
                return {
                    status: false,
                    error: { code: UserErrorCode.LOGOUT_FAILED, message: "Erro ao fazer logout" },
                }
            }

            const { error } = await supabaseAdmin.auth.admin.signOut(userId, "global")

            if (error) {
                return {
                    status: false,
                    error: { code: UserErrorCode.LOGOUT_FAILED, message: "Erro ao fazer logout" },
                }
            }

            await revokeAccessToken(accessToken)
            await revokeUserSessions(userId)

            return { status: true, data: null }
        } catch (error) {
            console.error("[UserService.logout] error:", error)
            return {
                status: false,
                error: { code: UserErrorCode.LOGOUT_FAILED, message: "Erro ao fazer logout" },
            }
        }
    }

    async refresh(refreshToken: string): Promise<ServiceResult<AuthTokens, UserErrorCode>> {
        try {
            const { data, error } = await supabaseAuth.auth.refreshSession({
                refresh_token: refreshToken,
            })

            if (error || !data.session || !data.user) {
                const revoked = isRefreshTokenReuseOrRevoked(error)

                return {
                    status: false,
                    error: {
                        code: revoked ? UserErrorCode.SESSION_REVOKED : UserErrorCode.INVALID_CREDENTIALS,
                        message: revoked
                            ? "Sessão encerrada por segurança. Faça login novamente."
                            : "Sessão expirada. Faça login novamente.",
                    },
                }
            }

            return {
                status: true,
                data: buildAuthTokens(data.session, data.user),
            }
        } catch (error) {
            console.error("[UserService.refresh] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.LOGIN_FAILED,
                    message: "Erro ao renovar sessão.",
                },
            }
        }
    }

    async getProfile(accessToken: string): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const userId = getUserIdFromAccessToken(accessToken)

            if (!userId) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_FETCH_FAILED,
                        message: "Sessão inválida.",
                    },
                }
            }

            const supabase = createSupabaseClientForUser(accessToken)

            const { data, error } = await supabase
                .from("users")
                .select(USER_PROFILE_SELECT)
                .eq("id", userId)
                .single()

            if (error || !data) {
                console.error("[UserService.getProfile]", error)
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_NOT_FOUND,
                        message: "Usuário não encontrado.",
                    },
                }
            }

            return {
                status: true,
                data: mapUserProfileRow(data),
            }
        } catch (error) {
            console.error("[UserService.getProfile] error:", error)

            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_FETCH_FAILED,
                    message: "Erro ao buscar perfil do usuário.",
                },
            }
        }
    }

    async updateProfile(
        accessToken: string,
        updates: { username: string }
    ): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const userId = getUserIdFromAccessToken(accessToken)

            if (!userId) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_UPDATE_FAILED,
                        message: "Sessão inválida.",
                    },
                }
            }

            const supabase = createSupabaseClientForUser(accessToken)

            const { data, error } = await supabase
                .from("users")
                .update({ username: updates.username })
                .eq("id", userId)
                .select(USER_PROFILE_SELECT)
                .single()

            if (error || !data) {
                console.error("[UserService.updateProfile]", error)
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_UPDATE_FAILED,
                        message: "Não foi possível atualizar o perfil.",
                    },
                }
            }

            return {
                status: true,
                data: mapUserProfileRow(data),
            }
        } catch (error) {
            console.error("[UserService.updateProfile] error:", error)

            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_UPDATE_FAILED,
                    message: "Erro ao atualizar perfil do usuário.",
                },
            }
        }
    }

    async changePassword(
        accessToken: string,
        payload: ChangePasswordDTO
    ): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const userId = getUserIdFromAccessToken(accessToken)

            if (!userId) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_UPDATE_FAILED,
                        message: "Sessão inválida.",
                    },
                }
            }

            const supabase = createSupabaseClientForUser(accessToken)

            const { data: profileRow, error: profileError } = await supabase
                .from("users")
                .select(USER_PROFILE_SELECT)
                .eq("id", userId)
                .single()

            if (profileError || !profileRow) {
                console.error("[UserService.changePassword] profile fetch failed:", profileError)
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_NOT_FOUND,
                        message: "Usuário não encontrado.",
                    },
                }
            }

            const mustChangePassword = profileRow.must_change_password === true

            if (!mustChangePassword) {
                const currentPassword =
                    "current_password" in payload ? payload.current_password : undefined

                if (!currentPassword) {
                    return {
                        status: false,
                        error: {
                            code: UserErrorCode.INVALID_PASSWORD,
                            message: "Informe a senha atual.",
                        },
                    }
                }

                const authClient = createEphemeralAuthClient()

                const { data: reauthData, error: reauthError } =
                    await authClient.auth.signInWithPassword({
                        email: profileRow.email,
                        password: currentPassword,
                    })

                if (reauthError || !reauthData.session) {
                    return {
                        status: false,
                        error: {
                            code: UserErrorCode.INVALID_CREDENTIALS,
                            message: "Senha atual incorreta.",
                        },
                    }
                }

                const { error: updateError } = await authClient.auth.updateUser({
                    password: payload.new_password,
                })

                if (updateError) {
                    console.error("[UserService.changePassword] update failed:", updateError)
                    return {
                        status: false,
                        error: {
                            code: UserErrorCode.USER_UPDATE_FAILED,
                            message: mapPasswordUpdateError(updateError.message),
                        },
                    }
                }
            } else {
                const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                    userId,
                    { password: payload.new_password }
                )

                if (updateError) {
                    console.error("[UserService.changePassword] admin update failed:", updateError)
                    return {
                        status: false,
                        error: {
                            code: UserErrorCode.USER_UPDATE_FAILED,
                            message: mapPasswordUpdateError(updateError.message),
                        },
                    }
                }
            }

            if (mustChangePassword) {
                const { error: flagError } = await supabaseAdmin
                    .from("users")
                    .update({ must_change_password: false })
                    .eq("id", userId)

                if (flagError) {
                    console.error("[UserService.changePassword] flag update failed:", flagError)
                }
            }

            return this.getProfile(accessToken)
        } catch (error) {
            console.error("[UserService.changePassword] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_UPDATE_FAILED,
                    message: "Não foi possível atualizar a senha.",
                },
            }
        }
    }

    async requestPasswordReset(
        payload: PasswordResetRequestDTO
    ): Promise<ServiceResult<{ accepted: true }, UserErrorCode>> {
        try {
            const identifier = payload.identifier.trim().toLowerCase()

            const { data: userRow } = await supabaseAdmin
                .from("users")
                .select("id")
                .eq("email", identifier)
                .maybeSingle()

            if (userRow?.id) {
                const { error: insertError } = await supabaseAdmin
                    .from("password_reset_requests")
                    .insert({
                        user_id: userRow.id,
                        identifier,
                        status: "pending",
                    })

                if (insertError) {
                    console.error("[UserService.requestPasswordReset] insert failed:", insertError)
                    return {
                        status: false,
                        error: {
                            code: UserErrorCode.PASSWORD_RESET_REQUEST_FAILED,
                            message: "Não foi possível registrar a solicitação.",
                        },
                    }
                }
            }

            return {
                status: true,
                data: { accepted: true },
            }
        } catch (error) {
            console.error("[UserService.requestPasswordReset] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.PASSWORD_RESET_REQUEST_FAILED,
                    message: "Não foi possível registrar a solicitação.",
                },
            }
        }
    }

    async updateProfileImage(
        accessToken: string,
        file: { buffer: Buffer; mimetype: string }
    ): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const userId = getUserIdFromAccessToken(accessToken)

            if (!userId) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_UPDATE_FAILED,
                        message: "Sessão inválida.",
                    },
                }
            }

            if (!file.buffer.length) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.PROFILE_IMAGE_INVALID,
                        message: "Arquivo de imagem vazio.",
                    },
                }
            }

            const now = new Date().toISOString()
            const supabase = createSupabaseClientForUser(accessToken)

            const { data: currentProfile, error: currentProfileError } = await supabase
                .from("users")
                .select("profile_image_url")
                .eq("id", userId)
                .single()

            if (currentProfileError) {
                console.error("[UserService.updateProfileImage] current profile:", currentProfileError)
            }

            const storagePath = await uploadProfileImageToStorage(
                userId,
                file.buffer,
                file.mimetype
            )

            const { data, error } = await supabase
                .from("users")
                .update({
                    profile_image_url: storagePath,
                    profile_image_updated_at: now,
                    updated_at: now,
                })
                .eq("id", userId)
                .select(USER_PROFILE_SELECT)
                .single()

            if (error || !data) {
                console.error("[UserService.updateProfileImage]", error)
                await deleteProfileImageFromStorage(storagePath).catch((removeError) => {
                    console.error("[UserService.updateProfileImage] rollback failed:", removeError)
                })

                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_UPDATE_FAILED,
                        message: "Não foi possível salvar a foto de perfil.",
                    },
                }
            }

            if (
                currentProfile?.profile_image_url &&
                currentProfile.profile_image_url !== storagePath
            ) {
                await deleteProfileImageFromStorage(currentProfile.profile_image_url).catch(
                    (removeError) => {
                        console.error(
                            "[UserService.updateProfileImage] old image cleanup failed:",
                            removeError
                        )
                    }
                )
            }

            return {
                status: true,
                data: mapUserProfileRow(data),
            }
        } catch (error) {
            console.error("[UserService.updateProfileImage] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_UPDATE_FAILED,
                    message: "Erro ao salvar a foto de perfil.",
                },
            }
        }
    }

    async deleteProfileImage(
        accessToken: string
    ): Promise<ServiceResult<UserProfile, UserErrorCode>> {
        try {
            const userId = getUserIdFromAccessToken(accessToken)

            if (!userId) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_UPDATE_FAILED,
                        message: "Sessão inválida.",
                    },
                }
            }

            const now = new Date().toISOString()
            const supabase = createSupabaseClientForUser(accessToken)

            const { data: currentProfile, error: currentProfileError } = await supabase
                .from("users")
                .select("profile_image_url")
                .eq("id", userId)
                .single()

            if (currentProfileError) {
                console.error("[UserService.deleteProfileImage] current profile:", currentProfileError)
            }

            const { data, error } = await supabase
                .from("users")
                .update({
                    profile_image_url: null,
                    profile_image_updated_at: null,
                    updated_at: now,
                })
                .eq("id", userId)
                .select(USER_PROFILE_SELECT)
                .single()

            if (error || !data) {
                console.error("[UserService.deleteProfileImage]", error)
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.USER_UPDATE_FAILED,
                        message: "Não foi possível remover a foto de perfil.",
                    },
                }
            }

            if (currentProfile?.profile_image_url) {
                await deleteProfileImageFromStorage(currentProfile.profile_image_url).catch(
                    (removeError) => {
                        console.error(
                            "[UserService.deleteProfileImage] storage cleanup failed:",
                            removeError
                        )
                    }
                )
            }

            return {
                status: true,
                data: mapUserProfileRow(data),
            }
        } catch (error) {
            console.error("[UserService.deleteProfileImage] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_UPDATE_FAILED,
                    message: "Erro ao remover a foto de perfil.",
                },
            }
        }
    }

    async getPublicProfileImageMeta(): Promise<
        ServiceResult<{ updated_at: string | null; image_url: string | null }, UserErrorCode>
    > {
        try {
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
                    error: {
                        code: UserErrorCode.USER_FETCH_FAILED,
                        message: "Erro ao buscar foto de perfil.",
                    },
                }
            }

            if (!data?.profile_image_url) {
                return {
                    status: true,
                    data: {
                        updated_at: null,
                        image_url: null,
                    },
                }
            }

            return {
                status: true,
                data: {
                    updated_at: data.profile_image_updated_at,
                    image_url: getProfileImagePublicUrl(
                        data.profile_image_url,
                        data.profile_image_updated_at
                    ),
                },
            }
        } catch (error) {
            console.error("[UserService.getPublicProfileImageMeta] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_FETCH_FAILED,
                    message: "Erro ao buscar foto de perfil.",
                },
            }
        }
    }

    async getPublicProfileImage(): Promise<
        ServiceResult<{ publicUrl: string }, UserErrorCode>
    > {
        try {
            const metaResult = await this.getPublicProfileImageMeta()

            if (!metaResult.status) {
                return {
                    status: false,
                    error: metaResult.error,
                }
            }

            if (!metaResult.data.image_url) {
                return {
                    status: false,
                    error: {
                        code: UserErrorCode.PROFILE_IMAGE_NOT_FOUND,
                        message: "Foto de perfil não encontrada.",
                    },
                }
            }

            return {
                status: true,
                data: {
                    publicUrl: metaResult.data.image_url,
                },
            }
        } catch (error) {
            console.error("[UserService.getPublicProfileImage] error:", error)
            return {
                status: false,
                error: {
                    code: UserErrorCode.USER_FETCH_FAILED,
                    message: "Erro ao buscar foto de perfil.",
                },
            }
        }
    }
}

export default new UserService()
