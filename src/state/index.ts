import { reactive } from "vue";

export const state = reactive({
  overlayMessage: "off",
  message: "projection",
  themeMessage: "true",
  drawMessage: "drawOff",
  measureMessage: "mOff",
  isMainMap:false,
  isWMTS:true,
  setMessage(msg: string) {
    this.message = msg;
  },
  setOverlayMessage(msg: string) {
    this.overlayMessage = msg;
  },
  setThemeMessage(msg: string) {
    this.themeMessage = msg;
  },
  setDrawMessage(msg: string) {
    if (this.drawMessage === "drawOff") {
      this.drawMessage = msg;
    } else {
      if (msg === "pointOn") {
        if (this.drawMessage === "pointOn") this.drawMessage = "pointOff";
        else this.drawMessage = msg;
      } else if (msg === "lineOn") {
        if (this.drawMessage === "lineOn") this.drawMessage = "lineOff";
        else this.drawMessage = msg;
      } else if (msg === "polygonOn") {
        if (this.drawMessage === "polygonOn") this.drawMessage = "polygonOff";
        else this.drawMessage = msg;
      } else if (msg === "circleOn") {
        if (this.drawMessage === "circleOn") this.drawMessage = "circleOff";
        else this.drawMessage = msg;
      } else this.drawMessage = msg;
    }
  },
  setMesureMessage(msg: string) {
    if (this.measureMessage === "mOff") {
      this.measureMessage = msg;
    } else {
      if (msg === "LineStringOn") {
        if (this.measureMessage === "LineStringOn")
          this.measureMessage = "LineStringOff";
        else this.measureMessage = msg;
      } else if (msg === "PolygonOn") {
        if (this.measureMessage === "PolygonOn")
          this.measureMessage = "PolygonOff";
        else this.measureMessage = msg;
      } else this.measureMessage = msg;
    }
  },
  setIsMainMap(){
    this.isMainMap=!this.isMainMap
  },
  setISWMTSMap(){
    this.isWMTS=!this.isWMTS
  }
});
