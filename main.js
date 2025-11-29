import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

const slideData = [
	{ title: 'Wind Stance', image: '/slider_img_1' },
	{ title: 'Earth Stance', image: '/slider_img_2' },
	{ title: 'Fire Stance', image: '/slider_img_3' },
	{ title: 'Water Stance', image: '/slider_img_4' },
	{ title: 'Void Stance', image: '/slider_img_5' },
]

const container = document.querySelector('.container')
const slider = document.querySelector('.slider')

let frontSlideIndex = 0
let isSliderAnimating = false

function initializeSlider() {
	slideData.forEach((slide, index) => {
		const slideElement = document.createElement('div')
		slideElement.className = 'slide'
		slideElement.innerHTML = `
				<picture class="slide-image">
					<source srcset="${slide.image}.avif" type="image/avif">
					<source srcset="${slide.image}.webp" type="image/webp">
					<img src="${slide.image}.jpg" alt="${slide.title}" loading="lazy">
				</picture>
				<h1 class="slide-title">${slide.title}</h1>
			`
		slider.appendChild(slideElement)
	})

	let slides = document.querySelectorAll('.slide')

	slides.forEach((slide) => {
		const title = slide.querySelector('.slide-title')
		new SplitText(title, {
			type: 'words',
			mask: 'words',
		})
	})

	slides.forEach((slide, i) => {
		gsap.set(slide, {
			y: -15 + 15 * i + '%',
			z: 15 * i,
			opacity: 1,
		})
	})
}

document.addEventListener('DOMContentLoaded', function () {
	initializeSlider()
})

let wheelAccumulator = 0
const wheelThreshold = 100
let isWheeleActive = false

container.addEventListener(
	'wheel',
	(e) => {
		e.preventDefault()

		if (isSliderAnimating || isWheeleActive) return

		wheelAccumulator += Math.abs(e.deltaY)

		if (wheelAccumulator >= wheelThreshold) {
			isWheeleActive = true
			wheelAccumulator = 0

			const direction = e.deltaY > 0 ? 'down' : 'up'
			handleSlideChange(direction)

			setTimeout(() => {
				isWheeleActive = false
			}, 1200)
		}
	},
	{ passive: false }
)

let touchStartY = 0
let touchStartX = 0
let isTouchActive = false
const touchThreshold = 50

container.addEventListener(
	'touchstart',
	(e) => {
		if (isSliderAnimating || isTouchActive) return
		touchStartY = e.touches[0].clientY
		touchStartX = e.touches[0].clientX
	},
	{ passive: true }
)

container.addEventListener(
	'touchend',
	(e) => {
		if (isSliderAnimating || isTouchActive) return

		const touchEndY = e.changedTouches[0].clientY
		const touchEndX = e.changedTouches[0].clientX
		const deltaY = touchStartY - touchEndY
		const deltaX = Math.abs(touchStartX - touchEndX)

		if (Math.abs(deltaY) > deltaX && Math.abs(deltaY) > touchThreshold) {
			isTouchActive = true

			const direction = deltaY > 0 ? 'down' : 'up'
			handleSlideChange(direction)

			setTimeout(() => {
				isTouchActive = false
			}, 1200)
		}
	},
	{ passive: true }
)

function handleSlideChange(direction = 'down') {
	if (isSliderAnimating) return
	isSliderAnimating = true

	if (direction === 'down') {
		handleScrollDown()
	} else {
		handleScrollUp()
	}
}

function handleScrollDown() {
	const slides = document.querySelectorAll('.slide')
	const firstSlide = slides[0]

	frontSlideIndex = (frontSlideIndex + 1) % slideData.length

	let newBackIndex = (frontSlideIndex + 4) % slideData.length
	let nextSlideData = slideData[newBackIndex]

	let newSlide = document.createElement('div')
	newSlide.className = 'slide'
	newSlide.innerHTML = `
				<picture class="slide-image">
					<source srcset="${nextSlideData.image}.avif" type="image/avif">
					<source srcset="${nextSlideData.image}.webp" type="image/webp">
					<img src="${nextSlideData.image}.jpg" alt="${nextSlideData.title}" loading="lazy">
				</picture>
			<h1 class="slide-title">${nextSlideData.title}</h1>
		`

	let newTitle = newSlide.querySelector('.slide-title')
	let newSplit = new SplitText(newTitle, {
		type: 'words',
		mask: 'words',
	})

	gsap.set(newSplit.words, {
		yPercent: 100,
	})

	slider.appendChild(newSlide)

	gsap.set(newSlide, {
		y: -15 + 15 * 5 + '%',
		z: 15 * 5,
		opacity: 0,
	})

	let allSlides = document.querySelectorAll('.slide')

	allSlides.forEach((slide, i) => {
		let targetPosition = i - 1

		gsap.to(slide, {
			y: -15 + 15 * targetPosition + '%',
			z: 15 * targetPosition,
			opacity: targetPosition < 0 ? 0 : 1,
			duration: 1,
			ease: 'power2.inOut',
			onComplete: () => {
				if (i === 0) {
					firstSlide.remove()
					isSliderAnimating = false
				}
			},
		})
	})

	gsap.to(newSplit.words, {
		yPercent: 0,
		duration: 0.75,
		ease: 'power4.out',
		stagger: 0.15,
		delay: 0.5,
	})
}

function handleScrollUp() {
	const slides = document.querySelectorAll('.slide')
	const lastSlide = slides[slides.length - 1]

	frontSlideIndex = (frontSlideIndex - 1 + slideData.length) % slideData.length
	let prevSlideData = slideData[frontSlideIndex]

	let newSlide = document.createElement('div')
	newSlide.className = 'slide'
	newSlide.innerHTML = `
			<picture class="slide-image">
				<source srcset="${prevSlideData.image}.avif" type="image/avif">
				<source srcset="${prevSlideData.image}.webp" type="image/webp">
				<img src="${prevSlideData.image}.jpg" alt="${prevSlideData.title}" loading="lazy">
			</picture>
			<h1 class="slide-title">${prevSlideData.title}</h1>
		`

	let newTitle = newSlide.querySelector('.slide-title')
	new SplitText(newTitle, {
		type: 'words',
		mask: 'words',
	})

	slider.prepend(newSlide)

	gsap.set(newSlide, {
		y: -15 + 15 * -1 + '%',
		z: 15 * -1,
		opacity: 0,
	})

	let slideQueue = Array.from(slider.querySelectorAll('.slide'))

	slideQueue.forEach((slide, i) => {
		let targetPosition = i

		gsap.to(slide, {
			y: -15 + 15 * targetPosition + '%',
			z: 15 * targetPosition,
			opacity: targetPosition > 4 ? 0 : 1,
			duration: 1,
			ease: 'power3.inOut',
			onComplete: () => {
				if (i === slideQueue.length - 1) {
					lastSlide.remove()
					isSliderAnimating = false
				}
			},
		})
	})
}
