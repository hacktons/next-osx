//next-screenshot-1560850957311.png
//next-screenshot-1560850957511.png
///private/var/folders/_9/60pyz1lx0dd7yd3z_x6py25r0000gq/T/cn.hacktons.next/cache/
var looksSame = require('looks-same');
const image1 = '/private/var/folders/_9/60pyz1lx0dd7yd3z_x6py25r0000gq/T/cn.hacktons.next/cache/next-screenshot-1560850957311.png';
const image2 = '/private/var/folders/_9/60pyz1lx0dd7yd3z_x6py25r0000gq/T/cn.hacktons.next/cache/next-screenshot-1560850957511.png';

export default function () {
    looksSame(image1, image2, function(error, {equal}) {
        // equal will be true, if images looks the same
        console.log(`two image equal=${equal}`);
    });
}