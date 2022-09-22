export interface RefreshTokenRepository {
	registerRefreshTokenFor(id: string, token: string): Promise<string>
}

export const createNullRefreshTokenRepository = (): RefreshTokenRepository => ({
	registerRefreshTokenFor: async (id, token) => token,
})
