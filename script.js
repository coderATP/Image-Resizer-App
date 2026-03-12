// ImageResizerApp.js
class ImageResizerApp {

  constructor(){
    this.images = []       // { img: HTMLImageElement, name: original filename }
    this.maxFiles = 10

    this.upload = document.getElementById("upload")
    this.widthInput = document.getElementById("width")
    this.heightInput = document.getElementById("height")

    this.aspectRatio = document.getElementById("aspectRatio")
    this.watermarkToggle = document.getElementById("watermarkToggle")
    this.watermarkText = document.getElementById("watermarkText")

    this.canvas = document.getElementById("canvas")
    this.ctx = this.canvas.getContext("2d")

    this.downloads = document.getElementById("downloads")
    this.resizeBtn = document.getElementById("resizeBtn")

    this.initEvents()
  }

  initEvents(){
    this.upload.addEventListener("change", (e) => this.loadImages(e))
    this.resizeBtn.addEventListener("click", () => this.resizeImages())

    this.watermarkToggle.addEventListener("change", () => {
      this.watermarkText.style.display =
        this.watermarkToggle.checked ? "block" : "none"
    })
  }

  async loadImages(e){
    const files = [...e.target.files]

    if(files.length > this.maxFiles){
      alert("Maximum 10 images allowed")
      return
    }

    this.images = []
    this.downloads.innerHTML = ""

    for(const file of files){
      const dataURL = await this.readFile(file)
      const img = await this.loadImage(dataURL)
      this.images.push({ img, name: file.name }) // store original filename
    }

    // Optional: auto-fill width & height inputs with first image's size
    if(this.images.length){
      this.widthInput.value = this.images[0].img.width
      this.heightInput.value = this.images[0].img.height
    }
  }

  readFile(file){
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.readAsDataURL(file)
    })
  }

  loadImage(src){
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = src
    })
  }

  getCompressionLevel(){
    const radios = document.querySelectorAll('input[name="compression"]')
    for(const r of radios){
      if(r.checked) return parseFloat(r.value)
    }
    return 0.7
  }

  calculateSize(img){
    let width = parseInt(this.widthInput.value)
    let height = parseInt(this.heightInput.value)

    if(!width && !height){
      width = img.width
      height = img.height
    }

    if(this.aspectRatio.checked){
      const ratio = img.width / img.height
      if(width && !height) height = width / ratio
      if(height && !width) width = height * ratio
    }

    return { width, height }
  }

  drawWatermark(width, height){
    const text = this.watermarkText.value || "ATP Game Studio"
    this.ctx.save()
    this.ctx.globalAlpha = 0.25
    this.ctx.fillStyle = "white"
    this.ctx.translate(width/2, height/2)
    this.ctx.rotate(-Math.PI/4)
    this.ctx.font = "40px Arial"
    this.ctx.textAlign = "center"
    this.ctx.fillText(text, 0, 0)
    this.ctx.restore()
  }

  resizeImages(){
    if(this.images.length === 0){
      alert("Please upload images first")
      return
    }

    this.downloads.innerHTML = ""
    const quality = this.getCompressionLevel()

    this.images.forEach(({img, name}, index) => {
      const { width, height } = this.calculateSize(img)

      this.canvas.width = width
      this.canvas.height = height
      this.ctx.clearRect(0, 0, width, height)
      this.ctx.drawImage(img, 0, 0, width, height)

      if(this.watermarkToggle.checked){
        this.drawWatermark(width, height)
      }

      const dataURL = this.canvas.toDataURL("image/jpeg", quality)

      // Create preview box
      const box = document.createElement("div")
      box.className = "resultBox"

      // Download button with original filename + underscore
      const btn = document.createElement("a")
      const dotIndex = name.lastIndexOf(".")
      const baseName = dotIndex !== -1 ? name.slice(0, dotIndex) : name
      const extension = dotIndex !== -1 ? name.slice(dotIndex) : ".jpg"
      btn.href = dataURL
      btn.download = `${baseName}_resized${extension}`
      btn.textContent = "Download"
      btn.className = "downloadBtn"

      // Tiny preview
      const preview = document.createElement("img")
      preview.src = dataURL

      box.appendChild(preview)  // preview first
      box.appendChild(btn)      // download button below
      this.downloads.appendChild(box)
    })
  }

}

new ImageResizerApp()