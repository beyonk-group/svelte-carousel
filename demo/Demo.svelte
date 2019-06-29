<div class="demo">
	<Carousel>
		<span class="control" slot="left-control">
			<ChevronLeftIcon />
		</span>
		<div class="slide-content">
			<header style="background-image: url(//placekitten.com/315)">
				
			</header>
			<section>
				Hello I am kitten
			</section>
		</div>
		<div class="slide-content">
			<header style="background-image: url(//placekitten.com/230)">
				
			</header>
			<section>
				I am fluffy
			</section>
		</div>
		<div class="slide-content">
			<header style="background-image: url(//placekitten.com/180)">
				
			</header>
			<section>
				I enjoy wool
			</section>
		</div>
		<div class="slide-content">
			<header style="background-image: url(//placekitten.com/320)">
				
			</header>
			<section>
				I eat beans
			</section>
		</div>
		<span class="control" slot="right-control">
			<ChevronRightIcon />
		</span>
	</Carousel>
</div>

<style>
	.demo {
		margin: 0 auto;
		height: 230px;
		width: 60vw;
	}
	
	.control :global(svg) {
		width: 100%;
		height: 100%;
		color: #fff;
		border: 2px solid #fff;
		border-radius: 32px;
	}
	
	.slide-content {
		border: 1px solid #eee;
		display: flex;
		flex-direction: column;
		height: 230px;
	}
	
	.slide-content header {
		flex: 1;
		background-size: cover;
	}
	
	.slide-content section {
		height: 40px;
		padding: 12px;
	}
</style>

<script>
	import Carousel from '../src/Carousel.svelte'
	import { ChevronLeftIcon, ChevronRightIcon } from 'svelte-feather-icons'
</script>