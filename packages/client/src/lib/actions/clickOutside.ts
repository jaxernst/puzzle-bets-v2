export function clickOutside(
  node: HTMLElement,
  { enabled: initialEnabled, cb }: { enabled: boolean; cb: () => void },
) {
  const handleClick = (event: MouseEvent) => {
    if (!node.contains(event.target as Node)) {
      cb()
    }
  }

  function update({ enabled }: { enabled: boolean }) {
    if (enabled) {
      document.addEventListener("click", handleClick)
    } else {
      document.removeEventListener("click", handleClick)
    }
  }

  update({ enabled: initialEnabled })

  return {
    update,
    destroy() {
      document.removeEventListener("click", handleClick)
    },
  }
}
