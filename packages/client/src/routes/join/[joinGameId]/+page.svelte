<script>
  import { page } from "$app/state"

  export let data
  let { description, title, usdValue } = data
</script>

<svelte:head>
  <title>{title}</title>
  <meta property="og:title" content={title} />
  <meta name="description" content={description} />
  <meta property="og:description" content={description} />
  <meta property="og:image" data-default content="/home-splash-landscape.png" />

  <meta
    name="fc:frame"
    content={JSON.stringify({
      version: "next",
      imageUrl: `https://puzzlebets.xyz/join-wordle-splash.png`,
      button: {
        title: usdValue ? `Join $${usdValue} Wordle Game` : `Join Wordle Game`,
        action: {
          type: "launch_frame",
          name: "Puzzle Bets",
          url: page.url.href,
          iconImageUrl: `https://puzzlebets.xyz/character-logo.png`,
          splashImageUrl: `https://puzzlebets.xyz/character1.png`,
          splashBackgroundColor: "#FFC700",
        },
      },
    })}
  />
</svelte:head>
