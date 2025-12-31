const ONScolours = {
  black: "#222",
  noData: "#DADADA",
  grey100: "#414042",
  grey75: "#707071",
  grey60: "#8D8C8E",
  grey50: "#A09FA0",
  grey40: "#b3b3b3",
  grey35: "#bcbcbd",
  grey30: "#C6C6C6",
  grey25: "#d5d5d6",
  grey20: "#d9d9d9",
  grey15: "#e2e2e3",
  grey10: "#efeff0",
  grey5: "#f5f5f6",
  white: "#fff",
  coralPink: "#F66068",
  oceanBlue: "#206095",
  skyBlue: "#27a0cc",
  skyBlueDark: "#1F80A3",
  nightBlue: "#003c57",
  emeraldGreen: "#118c7b",
  springGreen: "#a8bd3a",
  springGreenDark: "#8a9b2e",
  beetrootPurple: "#871A5B",
  coralPink: "#f66068",
  lavendarPurple: "#746cb1",
  mintGreen: "#22d0b6",
  mintGreenDark: "#1aa590",
  highlightOrange: "#f39431",
  highlightOrangeDark: "#f56927",
  darkLeafGreen: "#005253",
  female: "#6749A6",
  femaleLight: "#9A86E9",
  femaleAlt: "#9A86E9",
  male: "#2EA1A4",
  aquaTeal: "#00a3a6",
  leafGreen: "#0f8243",
  rubyRed: "#d0021b",
  jaffaOrange: "#fa6401",
  sunYellow: "#fbc900",
  neonYellow: "#f0f762",
  lightOrange: "#e8bb9b",
  oceanBlueTint: "#e9eff4",
  oceanBlueVibrant: "#1f8fd8",
  springGreenTint: "#c3c5b8",
  leafGreenTint: "#e7f3ec",
  leafGreenVibrant: "#10ca64",
  leafGreenDark10: "#073d20",
  coralPink:"#F66068",
  leafGreenDark5: "#0c6b37",
  rubyRedTint: "#fae6e8",
  rubyRedVibrant: "#fd112d",
  jaffaOrangeTint: "#fff0e6",
  jaffaOrangeVibrant: "#ff7b24",
  sunYellowDark: "#e2b500",
  navyBlueLight: "#153b55"
};

  // palettes (laid out in the similar order to https://ons-design.notion.site/Colour-335407345de94442b2adccbaa0b0b6e6#ce3cd24f0c4846d49f39486ddb4b4815)

  // categorical
  ONScolours.categorical = {
    old: [ONScolours.oceanBlue, ONScolours.skyBlue, ONScolours.beetrootPurple, ONScolours.springGreen, ONScolours.coralPink, ONScolours.emeraldGreen],
    oldText: [ONScolours.oceanBlue, ONScolours.skyBlueDark, ONScolours.beetrootPurple, ONScolours.springGreenDark, ONScolours.coralPink, ONScolours.emeraldGreen],
    current: [ONScolours.oceanBlue, ONScolours.springGreen, ONScolours.beetrootPurple, ONScolours.coralPink, ONScolours.darkLeafGreen, ONScolours.skyBlue],
    currentText: [ONScolours.oceanBlue, ONScolours.springGreenDark, ONScolours.beetrootPurple, ONScolours.coralPink, ONScolours.darkLeafGreen, ONScolours.skyBlueDark],
    div: [ONScolours.beetrootPurple, ONScolours.coralPink, ONScolours.grey50, ONScolours.skyBlue, ONScolours.oceanBlue],
    line: [ONScolours.oceanBlue, ONScolours.springGreen, ONScolours.beetrootPurple, ONScolours.coralPink, ONScolours.skyBlue, ONScolours.darkLeafGreen],
  };

  // positive and negative
  ONScolours.positive = ONScolours.oceanBlue;
  ONScolours.negative = ONScolours.coralPink;

  // female and male are in the const above

  // previous/current time period
  ONScolours.previous = "#959495";
  ONScolours.current = "#206095";

  // RAG (Red, Amber, Green) status / traffic lights
  ONScolours.rag = {
    red: ONScolours.rubyRed,
    amber: ONScolours.highlightOrange,
    green: ONScolours.aquaTeal,
    complete: ONScolours.nightBlue,
  };

  //sequential
  ONScolours.sequential = {
    standard: {
      3: ["#edf8b1","#7fcdbb","#2c7fb8"],
      4: ["#ffffcc","#a1dab4","#41b6c4","#225ea8"],
      5: ["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"],
      6: ["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"],
      7: ["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],
      8: ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],
      9: ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]
    },
    alternative: {
      3: ["#CDE594","#1F9EB7","#080C54"],
      4: ["#CDE594","#80C6A3","#1F9EB7","#080C54"],
      5: ["#CDE594","#80C6A3","#1F9EB7","#186290","#080C54"],
      6: ["#CDE594","#A3D3A0","#80C6A3","#1F9EB7","#186290","#080C54"],
      7: ["#CDE594","#A3D3A0","#80C6A3","#4CB1B5","#1F9EB7","#186290","#080C54"],
      8: ["#CDE594","#B6E0A2","#A3D3A0","#80C6A3","#4CB1B5","#1F9EB7","#186290","#080C54"],
      9: ["#CDE594","#B6E0A2","#A3D3A0","#80C6A3","#4CB1B5","#1F9EB7","#186290","#13406B","#080C54"]
    },
    popDensity: {
      3: ["#fde0dd","#fa9fb5","#c51b8a"],
      4: ["#feebe2","#fbb4b9","#f768a1","#ae017e"],
      5: ["#feebe2","#fbb4b9","#f768a1","#c51b8a","#7a0177"],
      6: ["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#c51b8a","#7a0177"],
      7: ["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],
      8: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],
      9: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"]  
    }
  };

  //diverging
  ONScolours.diverging = {
    negativeToPositive: {
      3: ["#ef8a62","#f7f7f7","#67a9cf"],
      4: ["#ca0020","#f4a582","#92c5de","#0571b0"],
      5: ["#ca0020","#f4a582","#f7f7f7","#92c5de","#0571b0"],
      6: ["#b2182b","#ef8a62","#fddbc7","#d1e5f0","#67a9cf","#2166ac"],
      7: ["#b2182b","#ef8a62","#fddbc7","#f7f7f7","#d1e5f0","#67a9cf","#2166ac"],
      8: ["#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac"],
      9: ["#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac"],
      10: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"],
      11: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"]
    },
    negativeToPositiveAlt: {
      3: ["#fc8d59","#ffffbf","#91bfdb"],
      4: ["#d7191c","#fdae61","#abd9e9","#2c7bb6"],
      5: ["#d7191c","#fdae61","#ffffbf","#abd9e9","#2c7bb6"],
      6: ["#d73027","#fc8d59","#fee090","#e0f3f8","#91bfdb","#4575b4"],
      7: ["#d73027","#fc8d59","#fee090","#ffffbf","#e0f3f8","#91bfdb","#4575b4"],
      8: ["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"],
      9: ["#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"],
      10: ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"],
      11: ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"]
    },
    declineToGrowth: {
      3: ["#3E558A", "#F5F5F6", "#ED7320"],
      4: ["#3E558A", "#CAC6DE", "#FED4A6", "#ED7320"],
      5: ["#3E558A", "#958BBA", "#F5F5F6", "#FDA13C", "#ED7320"],
      6: ["#3E558A", "#958BBA", "#CAC6DE", "#FED4A6", "#FDA13C", "#ED7320"],
      7: ["#3E558A", "#958BBA", "#CAC6DE", "#F5F5F6", "#FED4A6", "#FDA13C", "#ED7320"],
      8: ["#3E558A", "#7A7FA6", "#958BBA", "#CAC6DE", "#F5F5F6", "#FED4A6", "#FDA13C", "#ED7320"],
      9: ["#3E558A", "#7A7FA6", "#958BBA", "#B6B1CC", "#CAC6DE", "#F5F5F6", "#FED4A6", "#FDA13C", "#ED7320"]
    },
    likert: {
      3: ["#118C7B", "#c6c6c6", "#871A5B"],
      4: ["#118C7B", "#22D0B6", "#F66068", "#871A5B"],
      5: ["#118C7B", "#22D0B6", "#c6c6c6", "#F66068", "#871A5B"],
      6: ["#118C7B", "#22D0B6", "#A0E0D0", "#F6A0B6", "#F66068", "#871A5B"],
      7: ["#118C7B", "#22D0B6", "#80E0C6", "#c6c6c6", "#F6A0B6", "#F66068", "#871A5B"]
    }
  };

      // these are also in ONScolours but left here in case they are used elsewhere

const oldONSpalette = [ONScolours.oceanBlue, ONScolours.skyBlue, ONScolours.beetrootPurple, ONScolours.springGreen, ONScolours.coralPink, ONScolours.emeraldGreen];
const oldONStextPalette = [ONScolours.oceanBlue, ONScolours.skyBlueDark, ONScolours.beetrootPurple, ONScolours.springGreenDark, ONScolours.coralPink, ONScolours.emeraldGreen];

const ONSpalette = [ONScolours.oceanBlue, ONScolours.springGreen, ONScolours.beetrootPurple, ONScolours.coralPink, ONScolours.darkLeafGreen, ONScolours.skyBlue];
const ONStextPalette = [ONScolours.oceanBlue, ONScolours.springGreenDark, ONScolours.beetrootPurple, ONScolours.coralPink, ONScolours.darkLeafGreen, ONScolours.skyBlueDark];

const ONSdivPlatte = [ONScolours.beetrootPurple, ONScolours.coralPink, ONScolours.grey50, ONScolours.skyBlue, ONScolours.oceanBlue];
const ONSlinePalette = [ONScolours.oceanBlue, ONScolours.springGreen, ONScolours.beetrootPurple, ONScolours.coralPink, ONScolours.skyBlue, ONScolours.darkLeafGreen];

