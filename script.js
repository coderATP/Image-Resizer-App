// ImageResizerApp.js

class ImageResizerApp {

  constructor(){

    this.images = []
    this.maxFiles = 10

    this.upload =
      document.getElementById("upload")

    this.widthInput =
      document.getElementById("width")

    this.heightInput =
      document.getElementById("height")

    this.aspectRatio =
      document.getElementById("aspectRatio")

    this.watermarkToggle =
      document.getElementById("watermarkToggle")

    this.watermarkText =
      document.getElementById("watermarkText")

    this.canvas =
      document.getElementById("canvas")

    this.ctx =
      this.canvas.getContext("2d")

    this.downloads =
      document.getElementById("downloads")

    this.resizeBtn =
      document.getElementById("resizeBtn")

    this.pngCompressionSection =
      document.getElementById(
        "pngCompressionSection"
      )

    this.initEvents()
  }


  initEvents(){

    this.upload.addEventListener(
      "change",
      (e) => this.loadImages(e)
    )


    this.resizeBtn.addEventListener(
      "click",
      () => this.resizeImages()
    )


    this.watermarkToggle.addEventListener(
      "change",
      () => {

        this.watermarkText.style.display =
          this.watermarkToggle.checked
            ? "block"
            : "none"

      }
    )


    const formatRadios =
      document.querySelectorAll(
        'input[name="downloadFormat"]'
      )


    formatRadios.forEach(
      radio => {

        radio.addEventListener(
          "change",
          () => this.updatePNGOptions()
        )

      }
    )

  }


  updatePNGOptions(){

    const format =
      this.getDownloadFormat()


    this.pngCompressionSection.style.display =
      format === "png"
        ? "block"
        : "none"

  }


  async loadImages(e){

    const files =
      [...e.target.files]


    if(files.length > this.maxFiles){

      alert(
        "Maximum 10 images allowed"
      )

      return

    }


    this.images = []

    this.downloads.innerHTML = ""


    for(const file of files){

      const dataURL =
        await this.readFile(file)


      const img =
        await this.loadImage(dataURL)


      this.images.push({
        img,
        name: file.name
      })

    }


    if(this.images.length){

      this.widthInput.value =
        this.images[0].img.width

      this.heightInput.value =
        this.images[0].img.height

    }

  }


  readFile(file){

    return new Promise(resolve => {

      const reader =
        new FileReader()


      reader.onload =
        e => resolve(e.target.result)


      reader.readAsDataURL(file)

    })

  }


  loadImage(src){

    return new Promise(resolve => {

      const img =
        new Image()


      img.onload =
        () => resolve(img)


      img.src = src

    })

  }


  getCompressionLevel(){

    const radios =
      document.querySelectorAll(
        'input[name="compression"]'
      )


    for(const radio of radios){

      if(radio.checked){

        return parseFloat(
          radio.value
        )

      }

    }


    return 0.05

  }


  getDownloadFormat(){

    const radios =
      document.querySelectorAll(
        'input[name="downloadFormat"]'
      )


    for(const radio of radios){

      if(radio.checked){

        return radio.value

      }

    }


    return "jpg"

  }


  getPNGCompression(){

    const radios =
      document.querySelectorAll(
        'input[name="pngCompression"]'
      )


    for(const radio of radios){

      if(radio.checked){

        return radio.value

      }

    }


    return "strong"

  }


  calculateSize(img){

    let width =
      parseInt(
        this.widthInput.value
      )

    let height =
      parseInt(
        this.heightInput.value
      )


    if(!width && !height){

      width = img.width
      height = img.height

    }


    if(this.aspectRatio.checked){

      const ratio =
        img.width / img.height


      if(width && !height){

        height =
          width / ratio

      }


      if(height && !width){

        width =
          height * ratio

      }

    }


    return {

      width: Math.max(
        1,
        Math.round(width)
      ),

      height: Math.max(
        1,
        Math.round(height)
      )

    }

  }


  drawWatermark(width, height){

    const text =
      this.watermarkText.value ||
      "ATP Game Studio"


    this.ctx.save()

    this.ctx.globalAlpha = 0.50

    this.ctx.fillStyle = "white"


    this.ctx.translate(
      width / 2,
      height / 2
    )


    /*
     * Bottom-left → top-right diagonal.
     */
    this.ctx.rotate(
      Math.PI / 4
    )


    const fontSize =
      Math.floor(
        Math.min(
          width,
          height
        ) / 8
      )


    this.ctx.font =
      fontSize + "px Arial"


    this.ctx.textAlign =
      "center"


    this.ctx.fillText(
      text,
      0,
      0
    )


    this.ctx.restore()

  }


getPNGCompressionValue() {
  
  const level =
    this.getPNGCompression()
  
  
  if (level === "lossless") {
    
    return 0
    
  }
  
  
  if (level === "light") {
    
    return 1024
    
  }
  
  
  if (level === "strong") {
    
    return 512
    
  }
  
  
  if (level === "extreme") {
    
    return 256
    
  }
  
  
  return 512
  
}


  async createPNG(){

    /*
     * Get the actual RGBA pixels
     * from the resized canvas.
     */
    const imageData =
      this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      )


    const rgba =
      imageData.data


    const width =
      this.canvas.width

    const height =
      this.canvas.height


    const cnum =
      this.getPNGCompressionValue()


    /*
     * UPNG.encode() is synchronous.
     *
     * It returns a Uint8Array
     * containing the PNG file.
     */
    const pngData =
      UPNG.encode(
        [rgba.buffer],
        width,
        height,
        cnum
      )


    /*
     * Convert the PNG bytes into
     * a browser-downloadable Blob.
     */
    const blob =
      new Blob(
        [pngData],
        {
          type: "image/png"
        }
      )


    return URL.createObjectURL(blob)

  }


  createJPG(){

    const quality =
      this.getCompressionLevel()


    return this.canvas.toDataURL(
      "image/jpeg",
      quality
    )

  }


  async resizeImages(){

    if(this.images.length === 0){

      alert(
        "Please upload images first"
      )

      return

    }


    this.downloads.innerHTML = ""


    const format =
      this.getDownloadFormat()


    for(
      const {img, name}
      of this.images
    ){

      const {
        width,
        height
      } =
        this.calculateSize(img)


      /*
       * Set canvas dimensions.
       */
      this.canvas.width =
        width

      this.canvas.height =
        height


      /*
       * Clear everything first.
       *
       * This is important for PNG
       * transparency.
       */
      this.ctx.clearRect(
        0,
        0,
        width,
        height
      )


      /*
       * Draw resized image.
       */
      this.ctx.drawImage(
        img,
        0,
        0,
        width,
        height
      )


      /*
       * Optional watermark.
       */
      if(
        this.watermarkToggle.checked
      ){

        this.drawWatermark(
          width,
          height
        )

      }


      let downloadURL
      let extension


      if(format === "png"){

        /*
         * UPNG.js PNG compression.
         */
        downloadURL =
          await this.createPNG()


        extension = "png"

      }
      else {

        /*
         * Existing JPEG compression.
         */
        downloadURL =
          this.createJPG()


        extension = "jpg"

      }


      /*
       * Create result card.
       */
      const box =
        document.createElement("div")


      box.className =
        "resultBox"


      /*
       * Remove original extension.
       */
      const dotIndex =
        name.lastIndexOf(".")


      const baseName =
        dotIndex !== -1
          ? name.slice(
              0,
              dotIndex
            )
          : name


      /*
       * Download button.
       */
      const btn =
        document.createElement("a")


      btn.href =
        downloadURL


      btn.download =
        `_${baseName}.${extension}`


      btn.textContent =
        `Download ${extension.toUpperCase()}`


      btn.className =
        "downloadBtn"


      /*
       * Preview.
       */
      const preview =
        document.createElement("img")


      preview.src =
        downloadURL


      box.appendChild(
        preview
      )


      box.appendChild(
        btn
      )


      this.downloads.appendChild(
        box
      )

    }

  }

}


new ImageResizerApp()