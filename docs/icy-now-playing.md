# Metadatos ICY y compatibilidad con álbumes

La PWA utiliza el mismo elemento `<audio>` para reproducir radio. La consulta de metadatos
es independiente y **acotada**; nunca transmite audio a otro reproductor ni abre un proxy.

## Compatibilidad

1. Si una estación ofrece `metadataUrl` en su entrada JSON, consulta únicamente esa
   URL pública HTTPS. Soporta **AzuraCast** (`now_playing.song.title/artist/album/art`),
   **Icecast** (`icestats.source`, seleccionando el montaje correcto) y algunos JSON de
   **Shoutcast** (`songtitle`, `currentsong`).
2. Sin URL explícita, primero intenta `https://HOST/status-json.xsl`. Solo usa resultados
   de un `listenurl` que coincida con el montaje y servidor de esa emisora.
3. Si ese endpoint no proporciona metadatos, prueba un único bloque ICY usando
   `Icy-MetaData: 1` y la cabecera `Icy-MetaInt`, siempre con **CORS**. Cancela la
   respuesta tras el primer bloque y no supera ~96 KiB por consulta.
4. Cuando recibe datos válidos, consulta como máximo cada **30 segundos** mientras
   continúa reproduciendo. Hay timeout de 7 segundos, cancelación al cambiar de radio,
   pausar o quedar sin conexión, y protección frente a resultados atrasados.
5. Sin datos o sin CORS: la radio sigue funcionando; se mantiene el nombre de la
   emisora, y **no se inventa** ninguna canción ni álbum.

## Configuración de una estación

En `data/stations.json` o `data/stations-cajamarca.json`:

```json
{
  "name": "Mi radio",
  "country": "Perú",
  "region": "Jaén, Cajamarca",
  "url": "https://radio.example/stream",
  "metadataUrl": "https://radio.example/status-json.xsl"
}
```

Sustituye ambos dominios de ejemplo por URLs públicas reales de la **misma estación**.
No insertes credenciales, claves privadas, endpoints de administración ni tokens.
Una URL de AzuraCast típica es `https://radio.example/api/nowplaying/1`.

## Requisitos del servidor (alojamiento de streaming)

- El endpoint JSON debe permitir `Access-Control-Allow-Origin` desde
  `https://latanvillegas.online`.
- Para ICY, debe permitir la cabecera de solicitud `Icy-MetaData` y exponer
  `Icy-MetaInt` en `Access-Control-Expose-Headers`.
- Una URL HTTPS de streaming no garantiza permisos CORS para lectura de metadatos.
- **ICY estándar publica StreamTitle, no álbum.** El álbum y la carátula aparecen
  solo si la emisora envía extensiones como StreamAlbum/StreamArtwork o utiliza
  un API JSON que tenga esos campos.
- No es posible asegurar metadatos de todas las 124 emisoras sin validar sus
  servicios uno por uno o contar con endpoints autorizados.

## Verificación manual

Inicia una radio que publique metadatos; verifica cambios de canción y álbum en la
vista ampliada, en el dock y en el panel multimedia de Android. Cambia a otra
radio y confirma que desaparezcan los datos de la anterior. Pausa; comprueba
en Network que dejan de consultarse endpoints de metadatos. Los streams CORS
incompatibles deben seguir reproduciéndose sin metadatos.
