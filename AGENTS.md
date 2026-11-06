<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- The published site is the planner app only: `/` (src/routes/index.tsx) renders it and `/app` redirects there. The sales page lives unrouted in src/landing/Vendas.tsx; to publish it again, move it back into src/routes with its own head().
- Checkout URL, Meta Pixel ID and price live only in src/lib/checkout.ts; every buy button reads from there so one edit updates the whole page.
- Planner data is static (src/data/marmitas.json + src/assets/marmitas/mNNN.jpg, 640x480) and user state is localStorage only; there is no backend.
- The `bubble` color token is reserved for the floating buy bubbles; never use it elsewhere.
