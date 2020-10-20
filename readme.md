# Map Colonies discrete layers storage service

## notes

please run `npm run migration` and commit changes before every tag (`npm run release`).
this is required to keep db updates match the service version

# api usage

## create new image metadata

new image metadata can be saved by sending POST request with image metadata json as its body to /images.
the image metadata fields can be found [here](https://github.com/mapcolonies/geedocker/issues/12)

## read specific image metadata

existing image metadata can be retrieved by sending GET request to /images/\<image metadata id\>

## update existing image metadata

existing image metadata can be updated by sending PUT request with the updated fields as json in the request body to /images/\<image metadata id\>.

## delete existing image metadata

exsisting image meta data can be deleted by sending DELETE requst to /images/\<image metadata id\>

## search image metadata

image metadata can be search by sending any combination of the following field as json POST request body to /images/search:

- geometry: a geojson (see geojson specifications [here](https://tools.ietf.org/html/rfc7946)) point/polygon object. only metadata of images that intersect with the given polygon/point will be returned.
- startDate: date string in format: "YYYY-MM-DD". only images that ware imaged form at this date or after it will be returned.
- endDate: date string in format: "YYYY-MM-DD". only images that ware imaged form at this date or before it will be returned.
