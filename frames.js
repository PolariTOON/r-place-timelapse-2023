import fs from "node:fs/promises";
import url from "node:url";
import canvas from "canvas";
const {mkdir, readFile, readdir, writeFile} = fs;
const {fileURLToPath} = url;
const {createCanvas, loadImage} = canvas;
const here = import.meta.url;
const root = here.slice(0, here.lastIndexOf("/"));
const frames = await readdir(fileURLToPath(`${root}/r-place-atlas-2023/web/_img/canvas/main`));
frames.unshift(`../main-ex/start.png`);
const frameCount = frames.length;
const padding = `${frameCount - 1}`.length;
const centers = JSON.parse(await readFile(fileURLToPath(`${root}/r-place-atlas-2023/data/patches/super-bear-adventure.json`))).center;
const ranges = Object.keys(centers).map((key) => {
	const split = key.split("-");
	const start = Number(split[0]);
	const end = Number(split[1]);
	const range = [start, end];
	return range;
});
ranges.sort((rangeA, rangeB) => {
	const startA = rangeA[0];
	const startB = rangeB[0];
	if (startA < startB) {
		return -1;
	}
	if (startA > startB) {
		return 1;
	}
	return 0;
});
const rangeCount = ranges.length;
if (rangeCount === 0) {
	throw new Error();
}
const thresholds = [];
for (let k = 0; k < rangeCount - 1; ++k) {
	const previousRange = ranges[k];
	const nextRange = ranges[k + 1];
	const previousEnd = previousRange[1];
	const nextStart = nextRange[0];
	const threshold = Math.round((previousEnd + 1 + nextStart) / 2);
	thresholds.push(threshold);
}
thresholds.push(frameCount);
await mkdir(fileURLToPath(`${root}/frames`), {
	recursive: true,
});
for (let i = 0, j = 0; i < frameCount; ++i) {
	if (i >= thresholds[j]) {
		++j;
	}
	const frame = frames[i];
	const range = ranges[j];
	const [start, end] = range;
	console.log(`${i + 1} / ${frameCount} (frame ${frame}, range ${start}-${end})`);
	const image = await loadImage(fileURLToPath(`${root}/r-place-atlas-2023/web/_img/canvas/main/${frame}`));
	const {width, height} = image;
	const center = centers[`${start}-${end}`];
	const [cx, cy] = center;
	const x = cx - 160 / 2 + width / 2;
	const y = cy - 90 / 2 + height / 2;
	const canvas = createCanvas(160 * 12, 90 * 12);
	const context = canvas.getContext("2d");
	context.imageSmoothingEnabled = false;
	context.fillStyle = "#fff";
	context.fillRect(0, 0, 160 * 12, 90 * 12);
	context.drawImage(image, x, y, 160, 90, 0, 0, 160 * 12, 90 * 12);
	await writeFile(fileURLToPath(`${root}/frames/frame-${`${i}`.padStart(padding, "0")}.png`), canvas.toBuffer());
}
