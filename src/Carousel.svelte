
<div class="carousel">
	<button class="left" on:click={left}>
		<slot name="left-control"></slot>
	</button>
	<div class="slides" bind:this={siema}>
		<slot></slot>
	</div>
	<button class="right" on:click={right}>
		<slot name="right-control"></slot>
	</button>
</div>

<style>
	.carousel {
		position: relative;
		width: 100%;
		justify-content: center;
		align-items: center;
	}
	
	button {
		position: absolute;
		width: 40px;
		height: 40px;
		top: 50%;
		z-index: 50;
		margin-top: -20px;
		border: none;
		background-color: transparent;
	}

  button:focus {
    outline: none;
  }
	
	.left {
		left: 2vw;
	}
	
	.right {
		right: 2vw;
	}
</style>

<script>
	import Siema from 'siema'
	import { onMount } from 'svelte'
	
	export let perPage = 3
	export let loop = true
	
	let siema
	let controller
	
	onMount(() => {
		controller = new Siema({
			selector: siema,
			perPage,
			loop
		})
		
		return () => controller.destroy()
	})
	
	function left () {
		controller.prev()
	}
	
	function right () {
		controller.next()
	}
</script>