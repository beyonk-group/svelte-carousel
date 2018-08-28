<div class="wrap">
  <ul ref:carousel class='carousel is-set'>
    <slot />
  </ul>
  <div class="controls">
    <button class="prev" on:click="prev()">Prev</button>
    <ul class="pips">
      {#each seats as seat, i}
        <li on:click="go(i)"></li>
      {/each}
    </ul>
    <button class="next" on:click="next()">Next</button>
  </div>
</div>

<style>
  .wrap {
    position: relative;
    overflow: hidden;
  }

  .carousel {
    display: flex;
    left: -100%;
    list-style: none;
    margin: 0;
    padding: 0;
    position: relative;
    transform: translateX(100%);
  }

  :global(.carousel).is-reversing {
    transform: translateX(-100%);
  }

  .carousel.is-set {
    transform: none;
    transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .controls {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px;
	}
	
	ul {
	  height: 10%;
		margin-top: auto;
		list-style-type: none;
		padding: 0;
	}
	
	li {
		display: inline-block;
		height: 14px;
		width: 14px;
		border-radius: 14px;
		background-color: #eee;
		margin: 0 2px;
	}
	
  button {
    border: 0;
    border-radius: 0.25em;
    color: #eee;
    padding: 0.5em 1em;
    z-index: 999999;
  }

  button:hover, button:focus, li:hover, li:focus {
    background: magenta;
  }
</style>

<script>
  export default {
		data () {
			return {
				seats: 0
			}
		},
		
    oncreate () {
      const { current: providedCurrent } = this.get()
      const { carousel } = this.refs
      const seats = carousel.children
      const requiredSeat = 0 < providedCurrent - 2 <= seats.length ? providedCurrent - 2 : 0
      const current = seats[requiredSeat]
      this.set({ carousel, seats, current })
      this.setNewSeatOrder(current)
    },

    methods: {
      advance (el) {
        const { seats } = this.get()
        return el.nextElementSibling || seats[0]
      },
      go (num) {
        const { current, seats } = this.get()
        const newSeat = num === 0 ? seats[seats.length - 1] : seats[num - 1]
        if (current === newSeat) { return }
        this.refs.carousel.classList.remove('is-reversing')
        this.setNewSeatOrder(newSeat)
			},
      next () {
        const { current } = this.get()
        const newSeat = this.advance(current)
        this.refs.carousel.classList.remove('is-reversing')
        this.setNewSeatOrder(newSeat)
      },
      prev () {
        const { current, seats } = this.get()
        const newSeat = current.previousElementSibling || seats[seats.length - 1]
        this.refs.carousel.classList.add('is-reversing')
       	this.setNewSeatOrder(newSeat)
      },
			setNewSeatOrder (newSeat) {
				this.set({ current: newSeat })
        newSeat.style.order = 1
        this.setOrder(newSeat)
			},
      setOrder (newSeat) {
        const { seats } = this.get()
        let i, j, ref
        for (let i = j = 2, ref = seats.length; (2 <= ref ? j <= ref : j >= ref); i = 2 <= ref ? ++j : --j) {
          newSeat = this.advance(newSeat)
          newSeat.style.order = i
        }
        this.resetCarousel()
      },
      resetCarousel () {
        const { carousel } = this.get()
        carousel.classList.remove('is-set')
        setTimeout(function () {
          return carousel.classList.add('is-set')
        }, 50)
      }
    }
  }
</script>