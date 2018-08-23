<div class='wrap'>
  <ul ref:carousel class='carousel is-set'>
    <slot />
  </ul>
</div>
<div class='controls'>
  <button class='toggle' on:click="goPrev()">Prev</button>
  <button class='toggle' on:click="goNext()" data-toggle='next'>Next</button>
</div>

<style>
  .wrap {
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
    padding: 2em;
    text-align: center;
  }

  .controls button {
    background: #aaa;
    border: 0;
    border-radius: 0.25em;
    color: #eee;
    padding: 0.5em 1em;
  }

  .controls button:hover, .controls button:focus {
    background: magenta;
  }
</style>

<script>
  export default {
    oncreate () {
      this.set({
				carousel: this.refs.carousel,
				seats: this.refs.carousel.children
			})
    },

    methods: {
      next (el) {
        const { seats } = this.get()
        return el.nextElementSibling || seats[0]
      },
      prev (el) {
        const { seats } = this.get()
        return el.previousElementSibling || seats[seats.length - 1]
      },
      goNext () {
        const el = this.getCurrentSeat()
        let newSeat = this.next(el)
        this.refs.carousel.classList.remove('is-reversing')
        this.setNewSeatOrder(newSeat)
      },
      goPrev () {
        const el = this.getCurrentSeat()
        let newSeat = this.prev(el)
        this.refs.carousel.classList.add('is-reversing')
       	this.setNewSeatOrder(newSeat)
      },
			getCurrentSeat () {
				const el = document.getElementsByClassName('is-ref')[0]
        el.classList.remove('is-ref')
				return el
			},
			setNewSeatOrder (newSeat) {
				newSeat.classList.add('is-ref')
        newSeat.style.order = 1
        this.setOrder(newSeat)
			},
      setOrder (newSeat) {
        const { seats } = this.get()
        let i, j, ref
        for (let i = j = 2, ref = seats.length; (2 <= ref ? j <= ref : j >= ref); i = 2 <= ref ? ++j : --j) {
          newSeat = this.next(newSeat)
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