<div class="container flex h-full w-full justify-center p-4">
  <div class="inner-box">
    <slot />
  </div>
</div>

<style>
  .inner-box {
    background-color: #f0f0f0; /* Replace with your actual background color */
    min-height: 350px;
    width: 350px;
    aspect-ratio: 9 / 16;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin: auto; /* Auto margins for centering in all directions */
    overflow: hidden;
  }

  @media (max-width: 400px) {
    .inner-box {
      width: 90%;
      min-height: unset;
    }
  }
</style>
