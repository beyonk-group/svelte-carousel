<div class="wrap">
  <ul ref:carousel class='carousel is-set'>
    <slot />
  </ul>
  <div class="controls">
    <div class="prev" on:click="prev()">
      <slot name="prev">
        <div class="left"></div>
      </slot>
    </div>
    <ul class="pips">
      {#each seats as seat, i}
        <li on:click="go(i)"></li>
      {/each}
    </ul>
    <div class="next" on:click="next()">
      <slot name="next">
        <div class="right"></div>
      </slot>
    </div>
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
    margin-block-end: 0;
	}
	
	li {
		display: inline-block;
		height: 14px;
		width: 14px;
		border-radius: 14px;
		background-color: #fff;
		margin: 0 2px;
	}

  .prev, .next, li {
    opacity: 0.7;
    transition: 0.3s ease;
  }

  .prev:hover, .next:hover, li:hover {
    opacity: 1;
  }

	.left {
		margin-left: 10px;
		display: inline-block;
		border-right: 4px solid #fff;
		border-bottom: 4px solid #fff;
		width: 20px;
		height: 20px;
		transform: rotate(-225deg);
	}

	.right {
		margin-right: 10px;
		display: inline-block;
		border-right: 4px solid #fff;
		border-bottom: 4px solid #fff;
		width: 20px;
		height: 20px;
		transform: rotate(-45deg);
	}
</style>

<script>
  export default {
		data () {
			return {
        seats: 0,
        autoplay: false
			}
    },
		
    oncreate () {
      const { current: providedCurrent, autoplay } = this.get()
      const { carousel } = this.refs
      const seats = carousel.children
      const requiredSeat = 1 < providedCurrent <= seats.length ? providedCurrent - 1 : 0
      const current = seats[requiredSeat]
      this.set({ carousel, seats, current })
      this.go(providedCurrent - 1)
      this.start()
    },

    ondestroy () {
      this.stop()
    },

    methods: {
      start () {
        this.stop()
        const { autoplay } = this.get()

        if (!autoplay) {
          return
        }

        const timer = setInterval(function () {
          this.next()
        }.bind(this), autoplay)

        this.set({ timer })
      },

      stop () {
        const { timer } = this.get()
        clearInterval(timer)
        this.set({ timer: undefined })
      },

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