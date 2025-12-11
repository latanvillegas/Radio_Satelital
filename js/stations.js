// js/stations.js
// =======================
// DATA FRECUENCIAS v7.0 (Consolidado)
// =======================

const defaultStations = [
  // =======================================================
  // ====== ESTACIONES CONSOLIDADAS DEL NUEVO ARCHIVO ======
  // =======================================================
  [span_0](start_span){ name: "La Mega", country: "Venezuela", region: "", url: "https://eu1.lhdserver.es:9007/stream" },[span_0](end_span)
  [span_1](start_span){ name: "Disney FM", country: "Perú", region: "", url: "https://27433.live.streamtheworld.com/DISNEY_PER_LM_SC" },[span_1](end_span)
  [span_2](start_span){ name: "Acqua", country: "Argentina", region: "Mar del Plata", url: "https://sonic-us.streaming-chile.com:7006/" },[span_2](end_span)
  [span_3](start_span){ name: "Acqua 100.1", country: "Argentina", region: "Villa Gesell", url: "https://strcdn.klm99.com:10983/acquapinamar" },[span_3](end_span)
  [span_4](start_span){ name: "Arceri", country: "Costa Rica", region: "Aserrín", url: "https://stream-178.zeno.fm/rmnr2cphyxhvv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJybW5yMmNwaHl4aHZ2IiwiaG9zdCI6InN0cmVhbS0xNzguemVuby5mbSIsInJ0dGwiOjUsImp0aSI6ImRYMW41R2s4U08yYWx2V0JKcHRDWEEiLCJpYXQiOjE3NjU0MTkxOTEsImV4cCI6MTc2NTQxOTI1MX0.KWxdZmmrrZmvw7-yDyEuMHt6eBzZ2z_OfEElTQVFrPQ" },[span_4](end_span)
  { name: "Actitud", country: "México", region: "San Felipe", url: "https://radioenhd.com:8088/;" [span_5](start_span)},[span_5](end_span)
  [span_6](start_span){ name: "Actitud 100.9 FM", country: "Guatemala", region: "Ciudad de Guatemala", url: "https://ss.redradios.net:8002/stream" },[span_6](end_span)
  [span_7](start_span){ name: "Activa (Buenos Aires)", country: "Argentina", region: "Buenos Aires", url: "https://edge01.radiohdvivo.com/fmra1033" },[span_7](end_span)
  [span_8](start_span){ name: "Activa (Colombia)", country: "Colombia", region: "Tuquerres", url: "https://stream-177.zeno.fm/vkb12zqmgzzuv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJ2a2IxMnpxbWd6enV2IiwiaG9zdCI6InN0cmVhbS0xNzcuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6InVSNGNtcWRqUks2Q1dYb29xY2c5ckEiLCJpYXQiOjE3NjU0MTk2MDEsImV4cCI6MTc2NTQxOTY2MX0.mzmgEUJ2fr9JQ35IKW3sIeU7Ilioh400N-YjigAkiqM" },[span_8](end_span)
  [span_9](start_span){ name: "Activa (España)", country: "España", region: "Madrid", url: "https://stream-177.zeno.fm/vkb12zqmgzzuv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJ2a2IxMnpxbWd6enV2IiwiaG9zdCI6InN0cmVhbS0xNzcuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6InVSNGNtcWRqUks2Q1dYb29xY2c5ckEiLCJpYXQiOjE3NjU0MTk2MDEsImV4cCI6MTc2NTQxOTY2MX0.mzmgEUJ2fr9JQ35IKW3sIeU7Ilioh400N-YjigAkiqM" },[span_9](end_span)
  [span_10](start_span){ name: "Activa (Honduras)", country: "Honduras", region: "San Pedro Sula", url: "https://stream-177.zeno.fm/vkb12zqmgzzuv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJ2a2IxMnpxbWd6enV2IiwiaG9zdCI6InN0cmVhbS0xNzcuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6InVSNGNtcWRqUks2Q1dYb29xY2c5ckEiLCJpYXQiOjE3NjU0MTk2MDEsImV4cCI6MTc2NTQxOTY2MX0.mzmgEUJ2fr9JQ35IKW3sIeU7Ilioh400N-YjigAkiqM" },[span_10](end_span)
  { name: "Activa (Salina Cruz)", country: "México", region: "Salina Cruz", url: "https://sp3.servidorrprivado.com/6617/;" [span_11](start_span)},[span_11](end_span)
  [span_12](start_span){ name: "Activa (Yuriria)", country: "México", region: "Yuriria", url: "https://stream-177.zeno.fm/vkb12zqmgzzuv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJ2a2IxMnpxbWd6enV2IiwiaG9zdCI6InN0cmVhbS0xNzcuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6InVSNGNtcWRqUks2Q1dYb29xY2c5ckEiLCJpYXQiOjE3NjU0MTk2MDEsImV4cCI6MTc2NTQxOTY2MX0.mzmgEUJ2fr9JQ35IKW3sIeU7Ilioh400N-YjigAkiqM" },[span_12](end_span)
  [span_13](start_span){ name: "Activa (Puerto Rico)", country: "Puerto Rico", region: "San Juan", url: "https://cast3.asurahosting.com/proxy/univers1/stream" },[span_13](end_span)
  [span_14](start_span){ name: "Activa 100.7", country: "Argentina", region: "News", url: "https://sh4.radioonlinehd.com:8533/stream" },[span_14](end_span)
  [span_15](start_span){ name: "Activa 12340 AM", country: "EE.UU", region: "Nashville", url: "https://ice66.securenetsystems.net/WNVL" },[span_15](end_span)
  [span_16](start_span){ name: "Activa 88.7", country: "Argentina", region: "Pocito", url: "https://streaming.radiosenlinea.com.ar/9088/stream" },[span_16](end_span)
  [span_17](start_span){ name: "Activa 92.5 CL", country: "Chile", region: "Chile", url: "https://stream-154.zeno.fm/pvs6hqz3crtvv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJwdnM2aHF6M2NydHZ2IiwiaG9zdCI6InN0cmVhbS0xNTQuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6InpMR0Q1SEJRUWctazNNa3hNN2xVSXciLCJpYXQiOjE3NjU0MjA3NjcsImV4cCI6MTc2NTQyMDgyN30.R4EmPlaA0KfJ41x2S7efsqu98v_gkSg_7t9xV_Qcwvs" },[span_17](end_span)
  [span_18](start_span){ name: "Activa 95.1 FM Católica", country: "Guatemala", region: "Guatemala", url: "https://sh4.radioonlinehd.com:8557/stream" },[span_18](end_span)
  [span_19](start_span){ name: "Activa 99.7 FM", country: "Ecuador", region: "Santo Domingo de Los Colorado", url: "https://stream-142.zeno.fm/6n7fp9t2pceuv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiI2bjdmcDl0MnBjZXV2IiwiaG9zdCI6InN0cmVhbS0xNDIuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6Ill2OUlFS2N0Um9pZFFaWDRvclJaQkEiLCJpYXQiOjE3NjU0MjA5NDMsImV4cCI6MTc2NTQyMTAwM30.ZOf-uJfL4P364hvHh9raQmkUFQKFLrMpakK8EeSkXPo" },[span_19](end_span)
  [span_20](start_span){ name: "Activa El Salvador", country: "El Salvador", region: "San Miguel", url: "https://stream-179.zeno.fm/ar1f9iuyvhgtv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJhcjFmOWl1eXZoZ3R2IiwiaG9zdCI6InN0cmVhbS0xNzkuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6InUzZHdHWGF4U3hpY01Rc3BQeWVvUmciLCJpYXQiOjE3NjU0MjEwMzgsImV4cCI6MTc2NTQyMTA5OH0.vcaNAVo91j9YcFO6MOW9XX2DMblnYGQ_yRXvm3yMhI0" },[span_20](end_span)
  [span_21](start_span){ name: "Activa FM (Chile)", country: "Chile", region: "Santiago Providencia", url: "https://27433.live.streamtheworld.com/ACTIVA.mp3" },[span_21](end_span)
  [span_22](start_span){ name: "Activa FM 93.5", country: "Argentina", region: "Los Cóndores", url: "https://streaming5.locucionar.com/proxy/activafm?mp=/stream" },[span_22](end_span)
  [span_23](start_span){ name: "Activa FM (Bolivia)", country: "Bolivia", region: "La Paz", url: "https://stream-179.zeno.fm/007z22fpx38uv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiIwMDd6MjJmcHgzOHV2IiwiaG9zdCI6InN0cmVhbS0xNzkuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6IlBVYnFobWdOUlVHTU80M04zaDBXVWciLCJpYXQiOjE3NjU0MjE0MzUsImV4cCI6MTc2NTQyMTQ5NX0.j7G6_lvz-Dtb5lsSWIYiARLMAtIN5iy7WWKKjLuFnao" },[span_23](end_span)
  [span_24](start_span){ name: "Activa Jaén", country: "Perú", region: "Jaén, Cajamarca", url: "https://sp.onliveperu.com/8108/stream" },[span_24](end_span)
  [span_25](start_span){ name: "Activa La Paz", country: "Bolivia", region: "La Paz", url: "https://cloudstream2032.conectarhosting.com/9856/stream" },[span_25](end_span)
  [span_26](start_span){ name: "Activa Táchira Punta FM", country: "Venezuela", region: "San Cristóbal", url: "https://stream-157.zeno.fm/53vezhmmad0uv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiI1M3ZlemhtbWFkMHV2IiwiaG9zdCI6InN0cmVhbS0xNTcuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6Ii1vUTExOGtSU1dlZG82cHVzZk1JOEEiLCJpYXQiOjE3NjU0MjE3MjEsImV4cCI6MTc2NTQyMTc4MX0.Xqb3C5FezGjrayWw84Zmpn9tkMV0AIz4gcy8X3V152M" },[span_26](end_span)
  
  // =======================================================
  // ====== PERÚ (LIMA / NACIONAL) - DEL ARCHIVO ORIGINAL ======
  // =======================================================
  [span_27](start_span){ name: "Radio Moda", country: "Perú", region: "Sudamérica", url: "https://25023.live.streamtheworld.com/CRP_MOD_SC" },[span_27](end_span)
  [span_28](start_span){ name: "Ritmo Romántica", country: "Perú", region: "Sudamérica", url: "https://25103.live.streamtheworld.com/CRP_RIT_SC" },[span_28](end_span)
  [span_29](start_span){ name: "Onda Cero", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/6598b65ab398c90871aff8cc/icecast.audio" },[span_29](end_span)
  [span_30](start_span){ name: "La Zona", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/5fada54116646e098d97e6a5/icecast.audio" },[span_30](end_span)
  [span_31](start_span){ name: "Radio Corazón", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/5fada514fc16c006bd63370f/icecast.audio" },[span_31](end_span)
  [span_32](start_span){ name: "La Inolvidable", country: "Perú", region: "Sudamérica", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/CRP_LI_SC" },[span_32](end_span)
  [span_33](start_span){ name: "Radio Mágica", country: "Perú", region: "Sudamérica", url: "https://26513.live.streamtheworld.com/MAG_AAC_SC" },[span_33](end_span)
  [span_34](start_span){ name: "Radiomar", country: "Perú", region: "Sudamérica", url: "https://24873.live.streamtheworld.com/CRP_MARAAC_SC" },[span_34](end_span)
  [span_35](start_span){ name: "RPP Noticias", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/5fab3416b5f9ef165cfab6e9/icecast.audio" },[span_35](end_span)
  [span_36](start_span){ name: "Exitosa Noticias", country: "Perú", region: "Sudamérica", url: "https://neptuno-2-audio.mediaserver.digital/79525baf-b0f5-4013-a8bd-3c5c293c6561" },[span_36](end_span)
  [span_37](start_span){ name: "Radio PBO", country: "Perú", region: "Sudamérica", url: "https://stream.radiojar.com/2fse67zuv8hvv" },[span_37](end_span)
  [span_38](start_span){ name: "Radio Inca", country: "Perú", region: "Sudamérica", url: "https://stream.zeno.fm/b9x47pyk21zuv" },[span_38](end_span)
  [span_39](start_span){ name: "Radio ABN", country: "Perú", region: "Sudamérica", url: "https://jml-stream.com/radio/8000/radio.mp3" },[span_39](end_span)
  [span_40](start_span){ name: "Radio Abba Padre", country: "Perú", region: "Sudamérica", url: "https://stream-175.zeno.fm/6rrwumthg6quv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiI2cnJ3dW10aGc2cXV2IiwiaG9zdCI6InN0cmVhbS0xNzUuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6Im9XY2g3dmlTU0NHYlVGQ0QtZmNxUFEiLCJpYXQiOjE3NjQ3OTMwNDksImV4cCI6MTc2NDc5MzEwOX0.U3kdYbFm_XjuESzU_aSQ7owwkG9ScWV9h4fLn36I88U" },[span_40](end_span)

  // =======================================================
  // ====== PERÚ (REGIONALES) - DEL ARCHIVO ORIGINAL ======
  // =======================================================
  [span_41](start_span){ name: "Radio Turbo Mix", country: "Perú", region: "Sudamérica", url: "https://serverssl.innovatestream.pe:8080/167.114.118.120:7624/stream" },[span_41](end_span)
  [span_42](start_span){ name: "Radio Fuego", country: "Perú", region: "Sudamérica", url: "https://serverssl.innovatestream.pe:8080/sp.onliveperu.com:8128/" },[span_42](end_span)
  [span_43](start_span){ name: "Radio Andina", country: "Perú", region: "Sudamérica", url: "https://serverssl.innovatestream.pe:8080/http://167.114.118.120:7058/;stream" },[span_43](end_span)
  [span_44](start_span){ name: "Radio Ilucan", country: "Perú", region: "Sudamérica", url: "https://serverssl.innovatestream.pe:8080/167.114.118.120:7820/;stream" },[span_44](end_span)
  [span_45](start_span){ name: "Radio Santa Lucía", country: "Perú", region: "Sudamérica", url: "https://sp.dattavolt.com/8014/stream" },[span_45](end_span)
  [span_46](start_span){ name: "Radio Pampa Yurac", country: "Perú", region: "Sudamérica", url: "https://rr5200.globalhost1.com/8242/stream" },[span_46](end_span)
  [span_47](start_span){ name: "Radio Stereo TV", country: "Perú", region: "Sudamérica", url: "https://sp.onliveperu.com:7048/stream" },[span_47](end_span)
  [span_48](start_span){ name: "Radio La Kuadra", country: "Perú", region: "Sudamérica", url: "https://dattavolt.com/8046/stream" },[span_48](end_span)
  [span_49](start_span){ name: "Radio Frecuencia", country: "Perú", region: "Sudamérica", url: "https://conectperu.com/8384/stream" },[span_49](end_span)
  [span_50](start_span){ name: "Onda Popular (Lima)", country: "Perú", region: "Sudamérica", url: "https://envivo.top:8443/am" },[span_50](end_span)
  [span_51](start_span){ name: "Onda Popular (Juliaca)", country: "Perú", region: "Sudamérica", url: "https://dattavolt.com/8278/stream" },[span_51](end_span)
  [span_52](start_span){ name: "Radio Nor Andina", country: "Perú", region: "Sudamérica", url: "https://mediastreamm.com/8012/stream/1/" },[span_52](end_span)
  [span_53](start_span){ name: "Radio Bambamarca", country: "Perú", region: "Sudamérica", url: "https://envivo.top:8443/lider" },[span_53](end_span)
  [span_54](start_span){ name: "Radio Continente", country: "Perú", region: "Sudamérica", url: "https://sonic6.my-servers.org/10170/" },[span_54](end_span)
  [span_55](start_span){ name: "La Cheverísima", country: "Perú", region: "Sudamérica", url: "https://sp.onliveperu.com:8114/stream" },[span_55](end_span)
  [span_56](start_span){ name: "Radio TV El Shaddai", country: "Perú", region: "Sudamérica", url: "https://stream.zeno.fm/ppr5q4q3x1zuv" },[span_56](end_span)
  [span_57](start_span){ name: "Radio Inica Digital", country: "Perú", region: "Sudamérica", url: "https://stream.zeno.fm/487vgx80yuhvv" },[span_57](end_span)
  [span_58](start_span){ name: "Radio La Falsa", country: "Perú", region: "Sudamérica", url: "https://stream.zeno.fm/b9x47pyk21zuv" },[span_58](end_span)
  [span_59](start_span){ name: "Radio Activa", country: "Perú", region: "Sudamérica", url: "https://sp.onliveperu.com:8108/stream" },[span_59](end_span) 
  [span_60](start_span){ name: "Radio Mía", country: "Perú", region: "Sudamérica", url: "https://streaming.zonalatinaeirl.com:8020/radio" },[span_60](end_span)
  [span_61](start_span){ name: "Radio Patrón", country: "Perú", region: "Sudamérica", url: "https://streaming.zonalatinaeirl.com:8010/radio" },[span_61](end_span)
  [span_62](start_span){ name: "Radio TV Sureña", country: "Perú", region: "Sudamérica", url: "https://stream.zeno.fm/p7d5fpx4xnhvv" },[span_62](end_span)
  [span_63](start_span){ name: "Radio Enamorados", country: "Perú", region: "Sudamérica", url: "https://stream.zeno.fm/gnybbqc1fnruv" },[span_63](end_span)

  // =======================================================
  // ====== LATINOAMÉRICA / NORTEAMÉRICA - DEL ORIGINAL ======
  // =======================================================
  [span_64](start_span){ name: "Radio ABC (San Luis)", country: "México", region: "Norteamérica", url: "https://16643.live.streamtheworld.com/XHCZFM.mp3" },[span_64](end_span)
  [span_65](start_span){ name: "Radio ABC (Taxco)", country: "México", region: "Norteamérica", url: "https://streaming.servicioswebmx.com/8288/stream" },[span_65](end_span)
  [span_66](start_span){ name: "ABC 760", country: "México", region: "Norteamérica", url: "https://streamingcwsradio30.com/8292/stream" },[span_66](end_span)
  [span_67](start_span){ name: "ABC Radio Puebla", country: "México", region: "Norteamérica", url: "https://streaming.servicioswebmx.com/8264/stream" },[span_67](end_span)
  { name: "Radio Acceso Total", country: "México", region: "Norteamérica", url: "https://us10a.serverse.com/proxy/acce8712?mp=/;" [span_68](start_span)},[span_68](end_span)
  [span_69](start_span){ name: "Ach Kuxlejal 100.3", country: "México", region: "Norteamérica", url: "https://stream-178.zeno.fm/md6tfkaaechvv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJtZDZ0ZmthYWVjaHZ2IiwiaG9zdCI6InN0cmVhbS0xNzguemVuby5mbSIsInJ0dGwiOjUsImp0aSI6IkI4TUMzLXR3UTR1Q1VzbXY2M0gwUFEiLCJpYXQiOjE3NjQ3OTQ4MTksImV4cCI6MTc2NDc5NDg3OX0.xBJOxw_oGdW4sqNsL4n9WyUeK6CTvzAY8o5i5MjLe78" },[span_69](end_span)
  
  [span_70](start_span){ name: "ABC 94.7", country: "Argentina", region: "Sudamérica", url: "https://stream-176.zeno.fm/n03jc4xoy63tv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJuMDNqYzR4b3k2M3R2IiwiaG9zdCI6InN0cmVhbS0xNzYuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6Im9aa3kyRHRvUXBDU3kwNUF2OGdPX3ciLCJpYXQiOjE3NjQ3OTM2MzksImV4cCI6MTc2NDc5MzY5OX0.clgYVIm4DHZtHwGTjXdSfYi0SjVgGWj8UkiZEBz3yg0" },[span_70](end_span)
  [span_71](start_span){ name: "Estéreo Abejorral", country: "Colombia", region: "Sudamérica", url: "https://icecasthd.net/proxy/abejorral/live" },[span_71](end_span)
  [span_72](start_span){ name: "Abriendo Surcos", country: "Colombia", region: "Sudamérica", url: "https://djp.sytes.net/public/abriendo_surcos" },[span_72](end_span)
  { name: "Acacio de Chile", country: "Chile", region: "Sudamérica", url: "https://sonic.portalfoxmix.cl:7057/;" [span_73](start_span)},[span_73](end_span)
  [span_74](start_span){ name: "Acción FM", country: "Venezuela", region: "Sudamérica", url: "https://stream.intervalohost.com:7008/stream" },[span_74](end_span)
  [span_75](start_span){ name: "Aclo Chuquisaca", country: "Bolivia", region: "Sudamérica", url: "https://cloudstream2030.conectarhosting.com/8192/stream" },[span_75](end_span)
  [span_76](start_span){ name: "Aclo Tarija", country: "Bolivia", region: "Sudamérica", url: "https://cloudstream2030.conectarhosting.com/8242/stream" },[span_76](end_span)
  
  [span_77](start_span){ name: "Radio La Hondureña", country: "Honduras", region: "Centroamérica", url: "https://s2.mkservers.space/rih" },[span_77](end_span)
  [span_78](start_span){ name: "Abriendo Los Cielos", country: "Honduras", region: "Centroamérica", url: "https://stream-177.zeno.fm/a8uwe88svy8uv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJhOHV3ZTg4c3Z5OHV2IiwiaG9zdCI6InN0cmVhbS0xNzcuemVuby4mbSIsInJ0dGwiOjUsImp0aSI6Ik9VWVRibTdpUVUtQjVhSHFOWUNyX1EiLCJpYXQiOjE3NjQ3OTQwOTQsImV4cCI6MTc2NDc5NDE1NH0.n3CeLd9U7rcF9A9NsPpzFGJJjuPsUoaf2EsUxGah04w" },[span_78](end_span)
  [span_79](start_span){ name: "Una Radio Viva Voz", country: "Nicaragua", region: "Centroamérica", url: "https://rr5100.globalhost1.com/8006/stream" },[span_79](end_span)
  
  // =======================================================
  // ====== EEUU / EUROPA - DEL ARCHIVO ORIGINAL ======
  // =======================================================
  [span_80](start_span){ name: "105.3 El Ritmo", country: "EE.UU", region: "Norteamérica", url: "https://n02b-e2.revma.ihrhls.com/zc3209/hls.m3u8?rj-ttl=5&rj-tok=AAABmuXcB-4Ad7qhABJqQGGBcg" },[span_80](end_span)
  [span_81](start_span){ name: "Acción Cristiana", country: "EE.UU", region: "Norteamérica", url: "https://panel.lifestreammedia.net:8162/stream" },[span_81](end_span)

  [span_82](start_span){ name: "RFI Internacional", country: "Francia", region: "Europa", url: "https://rfienespagnol64k.ice.infomaniak.ch/rfienespagnol-64.mp3" },[span_82](end_span)
  [span_83](start_span){ name: "RFI Español (96k)", country: "Francia", region: "Europa", url: "https://rfiespagnol96k.ice.infomaniak.ch/rfiespagnol-96k.mp3" },[span_83](end_span)
  [span_84](start_span){ name: "DW Español", country: "Alemania", region: "Europa", url: "https://dwstream6-lh.akamaihd.net/i/dwstream6_live@123544/master.m3u8" },[span_84](end_span)
  
  [span_85](start_span){ name: "RNE 5 (España)", country: "España", region: "Europa", url: "https://dispatcher.rndfnk.com/crtve/rne5/main/mp3/high?aggregator=tunein" },[span_85](end_span)
  [span_86](start_span){ name: "RNE Radio Clásica", country: "España", region: "Europa", url: "https://rnelivestream.rtve.es/rnerc/main/master.m3u8" },[span_86](end_span)
  [span_87](start_span){ name: "RNE Radio Nacional", country: "España", region: "Europa", url: "https://f141.rndfnk.com/star/crtve/rne1/nav/mp3/128/ct/stream.mp3?cid=01GENZSPVYG0R84NK9E1C77RSZ&sid=36LhA65FiO252hsvxBqzfqiI4HF&token=-FbGT-8Eif8zgFPSMX7ER3TPiwAZ4pI8BsNKr1HldC4&tvf=HsCHLkTgfRhmMTQxLnJuZGZuay5jb20" },[span_87](end_span)
  [span_88](start_span){ name: "Radio AFRONTAR", country: "España", region: "Europa", url: "https://vigo-copesedes-rrcast.flumotion.com/copesedes/vigo-low.mp3" },[span_88](end_span)
  [span_89](start_span){ name: "AB 95 FM", country: "España", region: "Europa", url: "https://stream-153.zeno.fm/szskq9dxs98uv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJzenNrcTlkeHM5OHV2IiwiaG9zdCI6InN0cmVhbS0xNTMuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6Ims0M0xwaVpDVE1pRXExWVhvMEpjUmciLCJpYXQiOjE3NjQ3OTI4NjUsImV4cCI6MTc2NDc5MjkyNX0.dpzu-0oLrJ2nsOJU25J8ghjMS2O_2FSyXzntk4rD05A" },[span_89](end_span)
  [span_90](start_span){ name: "Radio Tele Taxi", country: "España", region: "Europa", url: "https://radiott-web.streaming-pro.com:6103/radiott.mp3" },[span_90](end_span)
  [span_91](start_span){ name: "Radio ES", country: "España", region: "Europa", url: "https://libertaddigital-radio-live1.flumotion.com/libertaddigital/ld-live1-low.mp3" },[span_91](end_span)
  [span_92](start_span){ name: "Cadena COPE", country: "España", region: "Europa", url: "https://net1-cope-rrcast.flumotion.com/cope/net1-low.mp3" }[span_92](end_span)
];
