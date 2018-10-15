<Carousel current="1">
	<Slide>
		<h2>1</h2>
	</Slide>
	<Slide>
		<h2>2</h2>
	</Slide>
	<Slide>
		<h2>3</h2>
	</Slide>
	<Slide>
		<h2>4</h2>
	</Slide>
	<Slide>
		<h2>5</h2>
	</Slide>
	<Slide>
		<h2>6</h2>
	</Slide>
</Carousel>

<style>
  h2 {
    color: #444;
    font-size: 7em;
    font-weight: normal;
    margin: 0;
    padding: 0.6em 0;
    text-align: center;
  }

	:global(.carousel) li:nth-of-type(even) {
		background-color: lightblue;
	}

	:global(.carousel) li:nth-of-type(odd) {
		background-color: lightcoral;
	}
</style>

<script>
	import Carousel from '../carousel/component.svelte'
	import Slide from '../slide/component.svelte'

  export default {
    components: {
			Carousel,
			Slide
		}
  }
</script>