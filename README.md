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

The [simplest possible demo](https://svelte.dev/repl/3953567d530b41d087ab7eaa8e7e632a?version=3.22.3)

```
npm install
npm run dev # http://localhost:12001
```

### To use within a Svelte application:

```bash
npm i -D @beyonk/svelte-carousel
```

## Usage

```jsx
<Carousel>
  <div class="slide-content">Slide 1</div>
  <div class="slide-content">Slide 2</div>
  <div class="slide-content">Slide 3</div>
  <div class="slide-content">Slide 4</div>
</Carousel>

<script>
	import Carousel from '@beyonk/svelte-carousel'
	import { ChevronLeftIcon, ChevronRightIcon } from 'svelte-feather-icons'
</script>
```

### Options

#### Controls

You can set the controls to be anything you like, though the default height and width are set to 40px. Just use the slots available to insert your own content.

```bash
npm i -D svelte-feather-icons
```

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
| duration  | number  | 200           | Slide transition duration in milliseconds.                                                				    |
| easing    | string  | 'ease-out'    | It is like a CSS transition-timing-function — describes acceleration curve.                                                  |
| startIndex | number | 0	      | Index (zero-based) of the starting slide.                                                 				     |
| draggable | boolean | true	      | Use dragging and touch swiping.                                                 				       |
| multipleDrag | boolean | true	      | Allow dragging to move multiple slides.                                                 				     |
| dots | boolean | true	      | Toggles visibility of slider dots.
| dotsColor | string | 'rgba(255,255,255,0.5)' | Change default dot color. |
| dotsHoverColor | string | 'rgba(255,255,255,0.85)' | Change default dot color on :hover. |
| dotsActiveColor | string | 'rgba(255,255,255,1)' | Change default dot color when active. |
| dotsWrapperClass | string | '' | Classes added to dots wrapper. |
| dotsClass | string | '' | Classes added to each dots element. If defined, default dots CSS won't be loaded. |
| dotsActiveClass | string | '' | Classes added to each dots element when active. If defined, default dots CSS won't be loaded. |
| controls | boolean | true	      | Toggles visibility of slider controls. dots.                                                 				  	       |
| threshold | number | 20	      | Touch and mouse dragging threshold (in px).                                                 				     |
| rtl | boolean | false	      | Enables layout for languages written from right to left (like Hebrew or Arabic).                                                |

perPage can also be set to a responsive object, to change the number of slides based on screen width:

```jsx
<Carousel perPage={{ 800: 3, 500: 2 }}>
// will show 1 slide below 500px width, 2 at 500, 3 at 800.
```

### Customizing

**Changing dots colors**

```svelte
<Carousel dotsColor="#FFAAAA"
          dotsHoverColor="#FC8888"
          dotsActiveColor="#FF0000">
```

**Changing dots classes**

Great for Tailwind CSS users.

```svelte
<Carousel dotsWrapperClass="flex items-center justify-center list-none"
          dotsClass="m-1 w-2 h-2 rounded-full bg-red-600 bg-opacity-50 hover:bg-opacity-75 cursor-pointer transition duration-150 ease-in-out"
          dotsActiveClass="bg-opacity-100">
```

Notice that when using `dotsClass` or `dotsActiveClass` default CSS wont be loaded – otherwise it would always overrule.

### Events

The Carousel components emits the following events:

| Name     | Data                           | Description                                                                    |
|----------|--------------------------------|--------------------------------------------------------------------------------|
| `change` | `{ currentSlide, slideCount }` | `currentSlide`: The current slide index. Can be a positive or negative integer. `slideCount`: The number of slides. |


### Actions

  You can call left, right, go(slideNumber), pause and resume functions on the slider. For example, for pausing the autoslide while the mouse is hover the carousel 
  
  ```jsx
<Carousel bind:this={carousel} on:mouseenter={enter} on:mouseleave={leave}>
  <div class="slide-content">Slide 1</div>
  ...
  <div class="slide-content">Slide n</div>
</Carousel>

<script>
  import Carousel from './Carousel.svelte'
  let carousel;
  
  function enter() {
    carousel.pause();
  }
  
  function leave() {
    carousel.resume();
  }
</script>
```

