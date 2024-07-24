<script lang="ts">
  import { type Game } from "$lib/types"
  import { entityToInt } from "$lib/util"
  let { game } = $props<{ game: Game }>()
</script>

<div
  class="flex w-[343px] flex-col gap-[10px] rounded bg-white p-4 text-[13px] leading-none"
  style={"box-shadow: 0px 5px 0px 0px #E3DDCD;"}
>
  <div class="flex justify-between">
    <div>
      #{entityToInt(game.id)}
      <div class="font-bold">Wordle</div>
    </div>

    <div
      class="bg-pb-yellow rounded-full px-[7px] py-[5px] text-[10px] font-bold leading-none"
    >
      Open
    </div>
  </div>

  <div class="flex flex-col">
    <div class="self-end text-xs text-[#757575]">Amount to Bet</div>

    <div class="flex items-center justify-between">
      <div class="flex gap-1">
        <img
          alt="Player Avatar"
          src={"/character1.png"}
          class="h-[20px] w-[20px]"
        />
        <div>0x123...456</div>
      </div>

      <div class=" flex gap-1 font-bold">
        <div>$5.00</div>
        <div class="text-[#8F8F8F]">(.00128 ETH)</div>
      </div>
    </div>
  </div>

  <button
    class="self-stretch rounded bg-black p-3 text-center text-base text-white"
  >
    Join
  </button>
</div>
