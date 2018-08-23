<li class="{ isActive ? 'is-ref' : '' }">
  <slot />
</li>

<style>
  li {
    background: #ddd;
    flex: 1 0 100%;
    order: 2;
  }

  li:nth-child(even) {
    background: #d5d5d5;
  }

  li.is-ref {
    order: 1;
  }
</style>