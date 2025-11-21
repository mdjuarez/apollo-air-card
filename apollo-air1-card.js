/* apollo-air1-card.js - Implementación de la tarjeta custom de sensores Apollo Air (Base definitiva) */

const LitEl =
  window.LitElement ||
  Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitEl.prototype.html;
const css = LitEl.prototype.css;

class ApolloAir1Card extends LitEl {
  static get properties() { return { hass: {}, _config: {} }; }

  setConfig(config) {
    if (!config || !config.slug) {
      throw new Error("Config inválida. Usa: slug (obligatorio). icon, title y popup opcionales.");
    }
    this._config = {
      popup: config.popup !== false,              // default: true
      chipsOnly: config["chips-only"] === true,   // default: false
      use_fahrenheit: config.use_fahrenheit === true,     // default: false (solo cambia la unidad)
      ...config,
    };
  }

  getCardSize() { return 3; }

  // helpers
  _num(id){ const st=this.hass?.states?.[id]?.state; const v=Number(st); return Number.isNaN(v)?0:v; }
  _fmt2(n){ return (Math.round(n*100)/100).toFixed(2).replace(/\.?0+$/,""); }
  _fmt1(n){ return (Math.round(n*10)/10).toFixed(1).replace(/\.?0+$/,""); }
  _fmt0(n){ return Math.round(n).toFixed(0); }
  _nice(s){ return String(s).replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()); }

  // Lógica de color de fondo para los chips
  _chipBg(metric,v){
    switch(metric){
      case "co":   return v<=5?"#9EDF9C":v<=10?"#78B3CE":v<=15?"#FBD288":v<=20?"#FF9C73":"#F95454";
      case "pm1":  return v<=10?"#9EDF9C":v<=20?"#78B3CE":v<=30?"#FBD288":v<=50?"#FF9C73":"#F95454";
      case "nh3":  return v<=0.5?"#9EDF9C":v<=1?"#78B3CE":v<=2?"#FBD288":v<=5?"#FF9C73":"#F95454";
      case "co2":  return v<=400?"#9EDF9C":v<=1000?"#78B3CE":v<=1500?"#FBD288":v<=2000?"#FF9C73":"#F95454";
      case "pm25": return v<=12?"#9EDF9C":v<=35?"#78B3CE":v<=55?"#FBD288":v<=150?"#FF9C73":"#F95454";
      case "ch4":  return v<=1000?"#9EDF9C":v<=2000?"#78B3CE":v<=5000?"#FBD288":v<=10000?"#FF9C73":"#F95454";
      case "no2":  return v<=20?"#9EDF9C":v<=50?"#78B3CE":v<=100?"#FBD288":v<=200?"#FF9C73":"#F95454";
      case "pm4":  return v<=10?"#9EDF9C":v<=30?"#78B3CE":v<=50?"#FBD288":v<=100?"#FF9C73":"#F95454";
      case "ethanol": return v<=5?"#9EDF9C":v<=20?"#78B3CE":v<=50?"#FBD288":v<=100?"#FF9C73":"#F95454";
      case "nox":  return v<=1?"#9EDF9C":v<=5?"#78B3CE":v<=20?"#FBD288":v<=50?"#FF9C73":"#F95454";
      case "pm10": return v<=20?"#9EDF9C":v<=50?"#78B3CE":v<=100?"#FBD288":v<=250?"#FF9C73":"#F95454";
      case "h2":   return v<=0.1?"#9EDF9C":v<=1?"#78B3CE":v<=5?"#FBD288":v<=10?"#FF9C73":"#F95454";
      case "temp": return "var(--apollo-temp-chip, #E7ECF0)";
      case "hum":  return "var(--apollo-hum-chip,  #E7ECF0)";
      case "voc":  return v<=100?"#9EDF9C":v<=200?"#78B3CE":v<=300?"#FBD288":v<=400?"#FF9C73":"#F95454";
      default:     return "#DDD";
    }
  }

  _getBrowserId() {
    try {
      if (window.browser_mod?.browserID) return window.browser_mod.browserID;
    } catch (e) {}
    try {
      const keys = [ "browser_mod-browser-id", "browser_mod-browser_id", "browser_mod.browser_id", "browser-mod-browser-id" ];
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (v) return v.replace(/^"+|"+$/g, "");
      }
    } catch (e) {}
    return "THIS_BROWSER";
  }
  
  _openPopup() {
    if (this._config.popup === false) return;
    const slug  = this._config.slug;
    const title = this._config.title ?? this._nice(slug);
    const stackType = customElements.get('vertical-stack-in-card') ? 'custom:vertical-stack-in-card' : 'vertical-stack';
  
    const content = {
      type: stackType,
      cards: [
        { type: "tile", name: "RGB", entity: `light.${slug}_rgb_light`, features_position: "bottom", vertical: false, features: [{ type: "light-brightness" }, { type: "toggle" }] },
        { type: "tile", name: "Reboot", entity: `button.${slug}_esp_reboot`, features_position: "inline", vertical: false, hide_state: true, features: [{ type: "button" }] },
        {
          type: "entities",
          title: "Sensors",
          entities: [
            { entity: `sensor.${slug}_carbon_monoxide`,               name: "Monóxido de Carbono (CO)",     icon: "mdi:molecule-co" },
            { entity: `sensor.${slug}_co2`,                            name: "Dióxido de Carbono (CO₂)",     icon: "mdi:molecule-co2" },
            { entity: `sensor.${slug}_nitrogen_dioxide`,               name: "Dióxido de Nitrógeno (NO₂)",   icon: "mdi:molecule" },
            { entity: `sensor.${slug}_sen55_nox`,                      name: "Óxidos de Nitrógeno (NOx)",     icon: "mdi:radiator" },
            { entity: `sensor.${slug}_pm_1_m_weight_concentration`,    name: "Concentración PM1 (<1µm)",     icon: "mdi:chemical-weapon" },
            { entity: `sensor.${slug}_pm_2_5_m_weight_concentration`,  name: "Concentración PM2.5 (<2.5µm)", icon: "mdi:chemical-weapon" },
            { entity: `sensor.${slug}_pm_4_m_weight_concentration`,    name: "Concentración PM4 (<4µm)",     icon: "mdi:chemical-weapon" },
            { entity: `sensor.${slug}_pm_10_m_weight_concentration`,   name: "Concentración PM10 (<10µm)",   icon: "mdi:chemical-weapon" },
            { entity: `sensor.${slug}_ammonia`,                        name: "Amoníaco (NH₃)",               icon: "mdi:cloud-alert" },
            { entity: `sensor.${slug}_methane`,                        name: "Metano (CH₄)",                 icon: "mdi:gas-burner" },
            { entity: `sensor.${slug}_ethanol`,                        name: "Etanol",                        icon: "mdi:flask-outline" },
            { entity: `sensor.${slug}_hydrogen`,                       name: "Hidrógeno (H₂)",               icon: "mdi:atom" },
            { entity: `sensor.${slug}_sen55_voc`,                      name: "Compuestos Orgánicos Volátiles (VOC)", icon: "mdi:biohazard" },
            { entity: `sensor.${slug}_dps310_pressure`,                name: "Presión Atmosférica",          icon: "mdi:weather-windy" },
            { entity: `sensor.${slug}_sen55_humidity`,                 name: "Humedad",                      icon: "mdi:water-percent" },
            { entity: `sensor.${slug}_sen55_temperature`,              name: "Temperatura",                  icon: "mdi:thermometer" },
            { entity: `sensor.${slug}_voc_quality`,                    name: "Calidad del Aire (VOC)",       icon: "mdi:air-purifier" },
          ],
        },
      ],
    };
  
    const browser_id = this._getBrowserId();
    const serviceData = { title, content };
  
    if (browser_id) {
      serviceData.browser_id = browser_id;
      serviceData.deviceID   = [browser_id];
      serviceData.broadcast  = false;
    }
  
    this.hass.callService("browser_mod", "popup", serviceData);
  }
  
  // ----------------------------------------------------------------------
  // Render (HTML)
  // ----------------------------------------------------------------------

  render(){
    const { slug } = this._config;
    const icon = this._config.icon || "mdi:bed";
    const displayName = this._config.title ?? this._config.name ?? this._nice(slug);

    // marcar el host con atributo chips-only cuando corresponda
    if (this._config.chipsOnly) {
      this.setAttribute("chips-only", "");
    } else {
      this.removeAttribute("chips-only");
    }

    // Valores para Temperatura y Humedad (solo usados en modo clásico)
    const tempValue = this._num(`sensor.${slug}_sen55_temperature`);
    const humValue  = this._num(`sensor.${slug}_sen55_humidity`);
    const tempUnit  = this._config.use_fahrenheit ? "°F" : "°C";  // <-- solo cambia el label

    
    // 4 columnas base de chips
    const baseChips = [
      [
        { icon:"mdi:molecule-co",      key:"co",   ent:`sensor.${slug}_carbon_monoxide`,              fmt:v=>this._fmt2(v) },
        { icon:"mdi:chemical-weapon",  key:"pm1",  ent:`sensor.${slug}_pm_1_m_weight_concentration`,  fmt:v=>this._fmt2(v) },
        { icon:"mdi:cloud-alert",      key:"nh3",  ent:`sensor.${slug}_ammonia`,                      fmt:v=>this._fmt2(v) },
      ],
      [
        { icon:"mdi:molecule-co2",     key:"co2",  ent:`sensor.${slug}_co2`,                           fmt:v=>this._fmt0(v) },
        { icon:"mdi:chemical-weapon",  key:"pm25", ent:`sensor.${slug}_pm_2_5_m_weight_concentration`, fmt:v=>this._fmt2(v) },
        { icon:"mdi:gas-burner",       key:"ch4",  ent:`sensor.${slug}_methane`,                       fmt:v=>this._fmt0(v) },
      ],
      [
        { icon:"mdi:molecule",         key:"no2",  ent:`sensor.${slug}_nitrogen_dioxide`,             fmt:v=>this._fmt2(v) },
        { icon:"mdi:chemical-weapon",  key:"pm4",  ent:`sensor.${slug}_pm_4_m_weight_concentration`,  fmt:v=>this._fmt2(v) },
        { icon:"mdi:flask-outline",    key:"ethanol", ent:`sensor.${slug}_ethanol`,                   fmt:v=>this._fmt2(v) },
      ],
      [
        { icon:"mdi:radiator",         key:"nox",  ent:`sensor.${slug}_sen55_nox`,                    fmt:v=>this._fmt2(v) },
        { icon:"mdi:chemical-weapon",  key:"pm10", ent:`sensor.${slug}_pm_10_m_weight_concentration`, fmt:v=>this._fmt2(v) },
        { icon:"mdi:atom",             key:"h2",   ent:`sensor.${slug}_hydrogen`,                     fmt:v=>this._fmt2(v) },
      ],
    ];

    // Si chips-only: agregamos columna extra con temp/hum/voc
    const chips = this._config.chipsOnly
      ? [
          [
            { icon:"mdi:thermometer",   key:"temp", ent:`sensor.${slug}_sen55_temperature`, fmt:v=>this._fmt0(v) },
            { icon:"mdi:water-percent", key:"hum",  ent:`sensor.${slug}_sen55_humidity`,    fmt:v=>this._fmt0(v) },
            { icon:"mdi:biohazard",     key:"voc",  ent:`sensor.${slug}_sen55_voc`,         fmt:v=>this._fmt0(v) },
          ],
          ...baseChips
        ]
      : baseChips;

    return html`
      <ha-card class="wrap">
        <div class="img_cell" @click=${this._config.popup !== false ? this._openPopup.bind(this) : null}>
          <ha-icon class="main_icon" icon="${icon}"></ha-icon>
        </div>
        
        <div class="content-left">
          <div class="name">${displayName}</div>
          ${this._config.chipsOnly ? "" : html`
            <div class="temp-value">
              <ha-icon icon="mdi:thermometer"></ha-icon> 
              ${this._fmt1(tempValue)}<span class="unit">${tempUnit}</span>
            </div>
            <div class="hum-value">
              <ha-icon icon="mdi:water-percent"></ha-icon>
              ${this._fmt0(humValue)}<span class="unit">%</span>
            </div>
          `}
        </div>

        <div class="grid ${this._config.chipsOnly ? 'chips-only' : ''}">
          ${chips.map((col, idx) => html`
            <div class="btn btn${idx+1}">
              ${col.map(c => {
                const v = this._num(c.ent);
                const bg = this._chipBg(c.key, v);
                const label = c.fmt(v);
                return html`
                  <div class="chip" style="background:${bg}"
                    @click=${() => this.dispatchEvent(new CustomEvent("hass-more-info",{bubbles:true,composed:true,detail:{entityId:c.ent}}))}>
                    <ha-icon icon="${c.icon}"></ha-icon>
                    <span>${label}</span>
                  </div>`;
              })}
            </div>
          `)}
        </div>
      </ha-card>
    `;
  }

  // ----------------------------------------------------------------------
  // Styles (CSS)
  // ----------------------------------------------------------------------
  static get styles() {
    return css`
    .wrap {
      position: relative;
      padding: 22px 5px 21px 22px;
      overflow: hidden;
      display: grid;
      grid-template-areas: "left grid";
      grid-template-columns: var(--apollo-chips-start, 1fr) max-content;

      --apollo-chips-start: calc(
        max(
          0px,
          (var(--apollo-bubble-size, 88px) + var(--apollo-bubble-offset, -12px))
        ) + var(--apollo-chips-gutter, 20px)
      );

      --apollo-temp-line-height: 1.1;

      --apollo-temp-size: 14px;
      --apollo-hum-size: 14px;
    }

    /* Defaults ESPECÍFICOS para modo chips-only, solo si chips-only está en true
       (host tiene atributo chips-only). El usuario aún puede sobreescribirlos con card_mod. */
    :host([chips-only]) {
      /* Burbuja + icono (más grande y con mejor contraste) */
      --apollo-bubble-size: 88px;
      --apollo-bubble-offset: -12px;
      --apollo-bubble-bg: #a8afb8;
      --apollo-icon-size: 44px;
      --apollo-icon-color: black;
      --apollo-icon-opacity: 0.6;

      /* Acomodo del bloque de chips para que no pisen la burbuja */
      --apollo-chips-gutter: 16px;
      --apollo-col-gap: 8px;
      --apollo-row-gap: 3px;

      /* Chips compactos pero legibles */
      --apollo-chip-icon-size: 14px;
      --apollo-chip-padding-y: 2px;
      --apollo-chip-padding-x: 6px;
      --apollo-chip-stack-gap: 5px;

      /* Badge detrás del pictograma del chip */
      --apollo-icon-badge-bg: rgba(255,255,255,.28);
      --apollo-icon-badge-radius: 9999px;
      --apollo-icon-badge-pad: 4px;
    }

    .content-left {
      grid-area: left;
      display: flex;
      flex-direction: column;
      justify-content: start;
      align-items: start;
      position: relative;
      z-index: 1;
    }

    .name {
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color, #000);
      margin-bottom: 8px;
      line-height: 1;
    }

    .temp-value {
      font-size: var(--apollo-temp-size);
      font-weight: 400;
      color: var(--apollo-temp-color, var(--primary-text-color, #000));
      line-height: 1.1;
      display: flex;
      align-items: center;
    }

    .temp-value ha-icon {
      --mdc-icon-size: calc(var(--apollo-temp-size) * 1.2);
      margin-right: 4px;
      color: var(--apollo-temp-color, var(--primary-text-color, #000));
      opacity: 0.9;
      --mdc-icon-color: var(--apollo-temp-color, var(--primary-text-color, #000));
    }

    .hum-value {
      font-size: var(--apollo-hum-size);
      color: var(--apollo-hum-color, var(--primary-text-color, #000));
      opacity: var(--apollo-hum-opacity, 0.8);
      margin-top: 0px;
      display: flex;
      align-items: center;
    }

    .hum-value ha-icon {
      --mdc-icon-size: 18px;
      opacity: var(--apollo-hum-opacity, 0.8);
      margin-right: 4px;
      color: var(--apollo-hum-color, var(--primary-text-color, #000));
      --mdc-icon-color: var(--apollo-hum-color, var(--primary-text-color, #000));
    }

    .unit {
      font-size: 0.6em;
    }

    .img_cell {
      justify-content: start;
      position: absolute;
      width: var(--apollo-bubble-size, 88px);
      height: var(--apollo-bubble-size, 88px);
      left: 0;
      bottom: 0;
      margin: 0 0 var(--apollo-bubble-offset, -12px) var(--apollo-bubble-offset, -12px);
      background: var(--apollo-bubble-bg, #a8afb8);
      border-radius: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 0;
      cursor: pointer;
    }

    .img_cell .main_icon {
      position: relative;
      --mdc-icon-size: var(--apollo-icon-size, 44px);
      width: var(--apollo-icon-size, 44px);
      height: var(--apollo-icon-size, 44px);
      color: var(--apollo-icon-color, black);
      opacity: var(--apollo-icon-opacity, 0.6);
    }

    .grid {
      grid-area: grid;
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-areas:
        "btn1 btn2 btn3 btn4"
        "btn1 btn2 btn3 btn4"
        "btn1 btn2 btn3 btn4";
      grid-template-columns: repeat(4, max-content);
      grid-auto-rows: min-content;

      column-gap: var(--apollo-col-gap, 16px);
      row-gap: var(--apollo-row-gap, 3px);

      padding-left: 0;
      justify-content: end;
      align-items: start;
      height: 100%;
    }

    .grid.chips-only {
      grid-template-areas:
        "btn1 btn2 btn3 btn4 btn5"
        "btn1 btn2 btn3 btn4 btn5"
        "btn1 btn2 btn3 btn4 btn5";
      grid-template-columns: repeat(5, max-content);
    }

    .btn {
      display: flex;
      flex-direction: column;
      gap: var(--apollo-chip-stack-gap, 5px);
      justify-self: end;
    }
    .btn1 { grid-area: btn1; }
    .btn2 { grid-area: btn2; }
    .btn3 { grid-area: btn3; }
    .btn4 { grid-area: btn4; }
    .btn5 { grid-area: btn5; }

    .chip {
      border-radius: 100px;
      padding: var(--apollo-chip-padding-y, 5px) var(--apollo-chip-padding-x, 6px);
      display: inline-flex;
      align-items: center;
      gap: var(--apollo-chip-gap, 4px);
      color: var(--primary-text-color);
      white-space: nowrap;
      cursor: pointer;
    }

    .chip ha-icon {
      --mdc-icon-size: var(--apollo-chip-icon-size, 14px);
      background: var(--apollo-icon-badge-bg, rgba(255, 255, 255, 0.28));
      border-radius: var(--apollo-icon-badge-radius, 9999px);
      padding: var(--apollo-icon-badge-pad, 4px);
    }
  `;
  }
}
customElements.define("apollo-air1-card", ApolloAir1Card);
