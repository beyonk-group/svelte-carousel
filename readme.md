# Svelte Carousel

Carousel which uses flexbox, and will scale to its largest piece of content.

### Demo

To run a demo, check this project out and run `npm run demo`

## Usage

### To use within any Javascript project
Simply install the package and require it in your javascript (or require it from CDN)

```bash
npm i -D @beyonk/svelte-carousel
```

```html
<script src="node_modules/@beyonk/svelte-carousel/lib/carousel.js"></script>

<!-- or -->
<script src="//unpkg.com/@beyonk/svelte-carousel@latest/lib/carousel.js"></script>
```

### To use within a Svelte application:

```bash
npm i -D @beyonk/svelte-carousel
```

```js
import Carousel from '@beyonk/svelte-carousel/src/components/carousel/component.svelte'
import Slide from '@beyonk/svelte-carousel/src/components/slide/component.svelte'

export default {
	components: {
		Carousel,
		Slide
	}
}
```

## Usage

```jsx
<Carousel current="3">
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
```

The `current` parameter is a 1-indexed number into your list of slides. The carousel will start on this slide.

### Customising controls

You can customise the controls by filling their slots. If you don't include slots, the default controls will be used:

```jsx
<Carousel current="1">
	<button slot="prev">&lt; Prev</button>
	<button slot="next">Next &gt;</button>
	<Slide>
		<h2>1</h2>
	</Slide>
	...
	<Slide>
		<h2>9</h2>
	</Slide>
</Carousel>
```

## Thanks

Huge thanks to [Nick A Walsh](https://codepen.io/nickawalsh/) for his original carousel, [Rich Harris](https://github.com/Rich-Harris) for his immense work on [Svelte](https://svelte.technology), and [Stu Plumbley](https://github.com/stuplum) for his limitless flexbox expertise.