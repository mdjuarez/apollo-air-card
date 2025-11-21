# apollo-air-card  
Custom card for the **Apollo AIR-1 Air Quality Sensor**  
🔗 https://apolloautomation.com/products/air-1

<img  alt="image" src="https://github.com/user-attachments/assets/da2c5a58-a46e-44bc-afda-3fccb04f765a" />


## ✨ Features

- **All AIR-1 sensors displayed as “traffic light” chips**  
  Each chip uses color-coding based on thresholds (green → red), allowing you to quickly see air quality at a glance.

- **Tap any sensor chip to open its history panel**  
  Every metric (CO2, NOx, PM2.5, CH4, VOC, etc.) opens directly in the Home Assistant “More Info” dialog so you can inspect trends and charts.

- **Popup with full sensor list + device controls**  
  Clicking the main icon opens a detailed popup (via browser_mod) that includes:
  - Full list of all AIR-1 sensors  
  - Reboot button for the ESP  
  - RGB control (brightness + toggle)

- **Fully themeable using CSS variables**  
  You can easily customize the chip shapes, badge gloss, spacing, icon sizes, and layout using `card_mod`.

---

## 🧩 Prerequisites

This card relies on a few Home Assistant frontend components:

### **Required**
- **card_mod**  
  https://github.com/thomasloven/lovelace-card-mod  
  Needed for styling overrides (optional but recommended).

- **browser_mod**  
  https://github.com/thomasloven/hass-browser_mod  
  Required for the popup that appears when clicking the main icon.

### **Optional (but supported by the card)**
Depending on your system, these may be used:

- **vertical-stack-in-card**  
  Used inside the popup if present.  
  https://github.com/ofekashery/vertical-stack-in-card

- **Mushroom / HA standard tiles**  
  The popup uses the built-in HA Tile card for RGB + reboot controls, but it also detects mushroom layouts if they exist.

If you're unsure, installing `browser_mod` and `card_mod` is usually enough.


---

## 📦 Installation (short version for advanced users)
(If you are a beginner, scroll down to the full installation guide at the end of this README.)

1. Create a folder named `apollo` inside `/config/www`
2. Copy `apollo-air1-card.js` into: /config/www/apollo/
3. Add a Lovelace resource:
/local/apollo/apollo-air1-card.js

Type: JavaScript Module

## 🚀 Usage

The card accepts a small set of simple configuration options.

### Basic example

<img  alt="image" src="https://github.com/user-attachments/assets/f54f4c86-b7d8-4072-a112-0ca7da163a0a" />

```yaml
type: custom:apollo-air1-card
slug: apollo_air_max
name: Max
```

### Available options

| Option | Required | Description |
|--------|----------|-------------|
| **slug** | ✔️ Yes | Base name of all AIR-1 entities. The card automatically reads sensors like `sensor.<slug>_co2`, `sensor.<slug>_pm_2_5_m_weight_concentration`, `sensor.<slug>_nh3`, etc. |
| **name** | ❌ Optional | Display name shown on the card. If omitted, it converts the slug into a readable label. |
| **icon** | ❌ Optional | Icon displayed inside the main circle. Default: `mdi:bed`. |
| **title** | ❌ Optional | Title used in the popup window when clicking the main icon. Defaults to the display name. |
| **popup** | ❌ Optional | Enables or disables the popup. Default: `true`. Set `popup: false` to disable it. |
| **chips-only** | ❌ Optional | When `true`, shows a **5-column layout** where Temperature, Humidity and VOC are displayed as chips (and the big temp/humidity section on the left is hidden). Default: `false`. |
| **use_fahrenheit** | ❌ Optional | When `true`, the main temperature label shows `°F` instead of `°C`. The value is taken directly from the sensor as-is. |


_In the classic layout, the VOC chip was omitted since VOC is not a key safety metric in normal home environments. Use chips-only = true if you want it.
The chips-only option slightly adjusts the chip layout to fit all sensors within the card, but all visual parameters can still be fully overridden through CSS variables for users who want deeper customization._

### What is slug?

slug is the base name used by all your AIR-1 sensor entities in Home Assistant.

For example, if your AIR-1 device exposes entities like:
```yaml
sensor.apollo_air_max_sen55_temperature
sensor.apollo_air_max_sen55_humidity
sensor.apollo_air_max_co2
sensor.apollo_air_max_pm_2_5_m_weight_concentration
sensor.apollo_air_max_methane
sensor.apollo_air_max_ammonia
```

Then the correct slug is: **apollo_air_max**

The card automatically builds all entity IDs 

### Examples
1. Custom icon + custom name
```yaml
type: custom:apollo-air1-card
slug: apollo_air_liz
name: Liz Room
icon: mdi:flower
```
2. Disable popup
```yaml
type: custom:apollo-air1-card
slug: apollo_air_kitchen
name: Kitchen
popup: false
```

3. Popup with custom title
```yaml
type: custom:apollo-air1-card
slug: apollo_air_cloe
name: Cloe
title: Cloe’s Air Sensors
```
4. Use Styles, for example if you want to move icons to the right

   <img alt="image" src="https://github.com/user-attachments/assets/7104ba97-4fa3-40e2-b992-e47c15090a78" />

```yaml
type: custom:apollo-air1-card
slug: apollo_air_max
name: Living Room
card_mod:
  style: |
    :host {
      --apollo-chips-gutter: 48px; 
    }
```
5.  chips-only false vs true
   ```yaml
type: custom:apollo-air1-card
slug: apollo_air_max
icon: mdi:bed
name: Max
chips-only: true
```

   <img alt="image" src="https://github.com/user-attachments/assets/eb64cb59-7f4f-4df0-ab18-99ab83b45049" />

## 🎨 Customize the Styles (optional)

The card exposes multiple CSS variables so you can restyle the chips, badges, spacing, and overall layout using card_mod.

<img  alt="image" src="https://github.com/user-attachments/assets/09e8e552-018b-4370-bb05-174d078c4d4e" />

Below are two example style presets:

Example 1
```yaml
card_mod:
  style: |
    :host {
      /* icon size */
      --apollo-chip-icon-size: 18px;

      /* HIGHER VALUES = more “pill-shaped” */
      --apollo-chip-padding-y: 12px;
      --apollo-chip-padding-x: 5px;

      /* space between icon and text */
      --apollo-chip-gap: 3px;

      /* badge highlight (centered + scaled) — subtle gradient gloss */
      --apollo-icon-badge-radius: 9999px;
      --apollo-icon-badge-pad: calc(var(--apollo-chip-icon-size) * 0.18);
      --apollo-icon-badge-bg:
        radial-gradient(85% 85% at 50% 50%,
          rgba(255,255,255,.30) 0%,
          rgba(255,255,255,.14) 55%,
          rgba(255,255,255,0) 56%),
        linear-gradient(180deg,
          rgba(255,255,255,.20) 0%,
          rgba(255,255,255,0) 42%),
        rgba(255,255,255,0);

      /* control circles with the SAME HEIGHT as the pill chips */
      --apollo-icon-chip-size: calc(var(--apollo-chip-icon-size) + (var(--apollo-chip-padding-y) * 2));
    }

    /* round pill shape */
    ha-card .chip { border-radius: 9999px !important; }

    /* centered gloss effect + subtle inner relief */
    ha-card .chip ha-icon {
      background-position: center center !important;
      background-size: 100% 100% !important;
      background-repeat: no-repeat !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.55),
        inset 0 -1px 0 rgba(0,0,0,.05);
    }
```
Example 2
```yaml
card_mod:
  style: |
    :host {
      /* badge roundness and fill */
      --apollo-icon-badge-bg: rgba(255, 255, 255, 0.28); /* or #fff2, etc */
      --apollo-icon-badge-radius: 9999px;
      --apollo-icon-badge-pad: 6px; /* more padding => larger circle */
      --apollo-chip-icon-size: 16px; /* optional: icon/pictogram size */

      /* make the chip more “rounded” */
      --apollo-chip-padding-x: 4px; /* less horizontal padding */
      --apollo-chip-padding-y: 6px; /* more height => more oval chip */
      --apollo-chip-stack-gap: 10px; /* vertical spacing between chips */

      /* optional background colors */
      /* --apollo-temp-chip: #eef2f5; */
      /* --apollo-hum-chip: #f2f4f7; */

      --apollo-chips-gutter: 20px;
      --apollo-col-gap: 16px;
    }
```

## 🧰 Beginner Installation Guide (Step-by-Step)

This guide explains how to install the **Apollo AIR-1 custom card** even if you've never installed a custom card before.

---

### ✅ 1. Enable Advanced Mode in Home Assistant

1. Go to **your profile** (bottom left in Home Assistant)
2. Scroll down
3. Turn on **Advanced Mode**

This is required so you can access the “Resources” section later.

---

### ✅ 2. Open the `www` folder

The card must be placed inside the `www` folder of Home Assistant.

1. Go to **Settings → Add-ons**
2. Open **File Editor** or **Studio Code Server**  
   (if you don’t have one installed, install *File Editor* from the Add-on Store)
3. Navigate to: /config/
4. If you do NOT see a folder named **www**, create it:
   - Click **New Folder**
   - Name it: `www`

Your structure should now look like: /config/www/

### ✅ 3. Create the “apollo” folder inside `www`

Inside `/config/www/`, create a new folder: /config/www/apollo/

---

### ✅ 4. Upload the card file

Download or copy the file: apollo-air1-card.js
Then put it inside: /config/www/apollo/apollo-air1-card.js


---

### ✅ 5. Add the resource in Home Assistant

1. Go to **Settings → Dashboards**
2. Click the **three dots** in the top-right
3. Choose **Resources**
4. Click **Add Resource**
5. Fill in:

- **URL:**  
  `/local/apollo/apollo-air1-card.js`
- **Resource type:**  
  `JavaScript Module`

6. Click **Create**

---

### ✅ 6. Reload the frontend (important)

To make sure the custom card loads:

- Press **CTRL + SHIFT + R**  
  _(or CMD + SHIFT + R on Mac)_

This forces a full refresh.

You can also go to:

**Developer Tools → YAML → Reload Resources**

---

### ✅ 7. Add the card to a dashboard

Go to the dashboard where you want to add it:

1. Click **Edit Dashboard**
2. Click **Add Card**
3. Choose **Manual card**
4. Paste the example:

```yaml
type: custom:apollo-air1-card
slug: apollo_air_max
name: Max



