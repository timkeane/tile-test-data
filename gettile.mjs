//https://tiles.arcgis.com/tiles/yG5s3afENB5iO9fj/arcgis/rest/services/NYC_Basemap/VectorTileServer/tile/14/6157/4823.pbf

import HttpsProxyAgent from 'https-proxy-agent'
import fetch from 'node-fetch'
import fs from 'fs'

/* the constants below can be adjusted by project */
const FEATURES_URL = 'https://services6.arcgis.com/yG5s3afENB5iO9fj/arcgis/rest/services/EFA_PFRED_Programs_PROD_view/FeatureServer/0/query?f=geojson&outFields=FID,distadd&where=1=1&outSR=3857'
const ZOOM_LEVEL = 14
const OBJ_ID_PROP = 'FID'
const ADDR_PROP = 'distadd'
const TEST_DATA_FILE = './test-data.csv'
/* the constants above can be adjusted by project */

const PROXY = new HttpsProxyAgent('http://bcpxy.nycnet:8080')
const ORIGIN = [-20037508.342789244, 20037508.342789244]
const RESOLUTIONS = [156543.03392804097, 78271.51696402048, 39135.75848201024, 19567.87924100512, 9783.93962050256, 4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141, 305.748113140705, 152.8740565703525, 76.43702828517625, 38.21851414258813, 19.109257071294063, 9.554628535647032, 4.777314267823516, 2.388657133911758, 1.194328566955879, 0.5971642834779395, 0.29858214173896974, 0.14929107086948487, 0.07464553543474244, 0.03732276771737122, 0.01866138385868561, 0.009330691929342804, 0.004665345964671402, 0.002332672982335701, 0.0011663364911678506, 0.0005831682455839253, 0.00029158412279196264, 0.00014579206139598132, 0.00007289603069799066, 0.00003644801534899533, 0.000018224007674497665, 0.000009112003837248832, 0.000004556001918624416, 0.000002278000959312208, 0.000001139000479656104, 5.69500239828052e-7, 2.84750119914026e-7, 1.42375059957013e-7, 7.11875299785065e-8, 3.559376498925325e-8]


const getTileInfo = async () => {
  let testData = 'objectid,address,tile_x,tile_y\n'
  const response = await fetch(FEATURES_URL, {agent: PROXY})
  const data = await response.json()
  data.features.forEach(f => {
    const geom = f.geometry
    if (geom) {
      const props = f.properties
      const point = geom.coordinates
      const resolution = RESOLUTIONS[ZOOM_LEVEL]
      const tileCoordX = (point[0] - ORIGIN[0]) / resolution / 256
      const tileCoordY = (ORIGIN[1] - point[1]) / resolution / 256
      testData = `${testData}${props[OBJ_ID_PROP]},"${props[ADDR_PROP]}",${Math.floor(tileCoordX)},${Math.floor(tileCoordY)}\n`
    }
  })
  fs.writeFile(TEST_DATA_FILE, testData, err => {
    if (err) {
      console.error(err)
    } else {
      console.warn(`${TEST_DATA_FILE} written successfully!`)
    }
  })
}

await getTileInfo()

