<p align="center">
  <img width="186" height="90" src="https://user-images.githubusercontent.com/218949/44782765-377e7c80-ab80-11e8-9dd8-fce0e37c235b.png" alt="Beyonk" />
</p>

## Svelte Carousel

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![CircleCI](https://circleci.com/gh/beyonk-adventures/svelte-carousel.svg?style=shield)](https://circleci.com/gh/beyonk-adventures/svelte-carousel) [![svelte-v2](https://img.shields.io/badge/svelte-v2-orange.svg)](https://v2.svelte.dev) [![svelte-v3](https://img.shields.io/badge/svelte-v3-blueviolet.svg)](https://svelte.dev)

Svelte Carousel / Slider

This is a ground-up rewrite of the original Svelte Carousel/Slider using Svelte v3, and [Siema](https://github.com/pawelgrzybek/siema), the goal being a fully working carousel with a tiny size.

## Usage

This library is pure javascript, so can be used with any framework you like.

### Demo

```
npm run dev # http://localhost:12001
```

### To use within a Svelte application:

```bash
npm i -D @beyonk/svelte-carousel
```

## Usage

```jsx
<Carousel>
  <span class="control" slot="left-control">
    <ChevronLeftIcon />
  </span>
  <div class="slide-content">Slide 1</div>
  <div class="slide-content">Slide 2</div>
  <div class="slide-content">Slide 3</div>
  <div class="slide-content">Slide 4</div>
  <span class="control" slot="right-control">
    <ChevronRightIcon />
  </span>
</Carousel>

<script>
	import Carousel from './Carousel.svelte'
	import { ChevronLeftIcon, ChevronRightIcon } from 'svelte-feather-icons'
</script>
```

### Options

#### Controls

You can set the controls to be anything you like, though the default height and width are set to 40px. Just use the slots available to insert your own content.

```jsx
<Carousel>
  <span class="control" slot="left-control">
    <ChevronLeftIcon />
  </span>
  <div class="slide-content">Slide 1</div>
  ...
  <div class="slide-content">Slide n</div>
  <span class="control" slot="right-control">
    <ChevronRightIcon />
  </span>
</Carousel>

<script>
	import Carousel from './Carousel.svelte'
	import { ChevronLeftIcon, ChevronRightIcon } from 'svelte-feather-icons'
</script>
```

If you need to override height and width, you can use CSS:

```css
	.control :global(svg) {
		width: 100%;
		height: 100%;
		color: #fff;
		border: 2px solid #fff;
		border-radius: 32px;
	}
```

#### Attributes

You can pass the following attributes:

| Attribute | Type    | Default Value | Description                                                                                                                  |
|-----------|---------|---------------|------------------------------------------------------------------------------------------------------------------------------|
| loop      | boolean | true          | At the end of the carousel, loop through to the first slide again, seamlessly                                                |
| perPage   | integer | 3             | Number of slides on a single page. Note that this needs to be greater than or equal to the number of slides in your carousel |
| autoplay  | integer | 0             | Auto-change slide at an interval (in milliseconds). 0 means don't autoplay.                                                  |