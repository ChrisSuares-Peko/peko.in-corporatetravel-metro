// Single toggle for the "login disabled" prototype mode.
//
// Flip this back to `false` to restore the normal login flow everywhere it's
// referenced: `AuthGuard`, `CorporateAccessGuard`, the default landing route in
// `routes/sections/index.tsx`, the initial Redux auth state in `loginSlice.ts`,
// and the axios interceptors in `services/config.ts` that otherwise hard-redirect
// to `/session-expired` when there's no valid token.
export const AUTH_DISABLED: boolean = true;
