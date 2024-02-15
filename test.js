function it(msg, fn) { console.assert(fn(), msg); }

window.addEventListener("load", async () => {
    await sleep(500);

    let data = globalData.monthlyVariance

    it("should have a title with a corresponding id=\"title\"", () => {
        return document.querySelector("#title") !== undefined;
    });

    it("should have a description with a corresponding id=\"description\"", () => {
        return document.querySelector("#description") !== undefined;
    });

    it("should have an x-axis with a corresponding id=\"x-axis\"", () => {
        return document.querySelector("#x-axis") !== undefined;
    });

    it("should have an y-axis with a corresponding id=\"y-axis\"", () => {
        return document.querySelector("#y-axis") !== undefined;
    });

    it("should have rect elements with a class=\"cell\" that represents the data", () => {
        let cells = document.querySelectorAll("rect.cell");

        return cells.length === data.length;
    });

    it("should have at least 4 different fill colors for the cells", () => {
        let cells = document.querySelectorAll("rect.cell");
        let set = new Set();

        for (let cell of cells) set.add(cell.getAttribute("fill"));

        return set.size >= 4;
    });

    it("each cell should have the properties data-month, data-year, data-temp containing their corresponding month, year, and temperature values", () => {
        let cells = document.querySelectorAll("rect.cell");

        for (let i = 0; i < cells.length; i++) {
            let match = data.find(v => v.month == cells[i].dataset.month && v.year == cells[i].dataset.year);

            if (!match || Math.abs(cells[i].dataset.temp - (globalData.baseTemperature + match.variance)) > 0.01) {
                return false;
            }
        }

        return true;
    });

    it("data-month and data-year of each cell should be within the range of the data", () => {
        let cells = document.querySelectorAll("rect.cell");
        let min = data[0];
        let max = data[data.length - 1];

        for (let i = 0; i < cells.length; i++) {
            if (cells[i].dataset.year < min.year ||
                (cells[i].dataset.year == min.year && cells[i].dataset.month < min.month) ||
                cells[i].dataset.year > max.year ||
                (cells[i].dataset.year == max.year && cells[i].dataset.month > max.month)
            ) return false;
        }

        return true;
    });

    it("should have cells that align with the corresponding month on the y-axis", () => {
        let cells = document.querySelectorAll("rect.cell");
        let expectedY = {};

        for (let i = 0; i < cells.length; i++) {
            let month = cells[i].dataset.month;

            if (!expectedY[month]) expectedY[month] = cells[i].getAttribute("y");
            else if (expectedY[month] != cells[i].getAttribute("y")) return false;
        }

        return true;
    });

    it("should have cells that align with the corresponding year on the x-axis", () => {
        let cells = document.querySelectorAll("rect.cell");
        let expectedX = {};

        for (let i = 0; i < cells.length; i++) {
            let year = cells[i].dataset.year;

            if (!expectedX[year]) expectedX[year] = cells[i].getAttribute("x");
            else if (expectedX[year] != cells[i].getAttribute("x")) return false;
        }

        return true;
    });

    it("should have multiple tick labels on the y-axis with the full month name", () => {
        let ticks = document.querySelectorAll("#y-axis .tick text");
        let months = [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december"
        ];
        let isMonthPresent = Array(12).fill(false);

        for (let tick of ticks) {
            let index = months.findIndex(m => m == tick.textContent.toLowerCase());

            if (index != -1) isMonthPresent[index] = true;
        }

        return isMonthPresent.every(v => v);
    });

    it("should have multiple tick labels on the x-axis with years between 1754 and 2015", () => {
        let ticks = document.querySelectorAll("#x-axis .tick text");

        for (let tick of ticks) {
            if (Number(tick.textContent) < 1754 || Number(tick.textContent) > 2015) return false;
        }

        return true;
    });

    it("should have a legend with a corresponding id=\"legend\"", () => {
        return document.querySelector("#legend") !== undefined;
    });

    it("should contain rect elements in legend", () => {
        return document.querySelectorAll("#legend rect").length > 1;
    });

    it("should use at least 4 different fill colors for the rect elements in legend", () => {
        let rects = document.querySelectorAll("#legend rect");
        let set = new Set();

        for (let rect of rects) set.add(rect.getAttribute("fill"));

        return set.size >= 4;
    });

    let cell = document.querySelectorAll(".cell")[0];
    let mOver = new MouseEvent("mouseover");
    let mLeave = new MouseEvent("mouseleave");
    mOver.fromTarget = mLeave.fromTarget = cell;
    cell.dispatchEvent(mOver);

    it("I can mouse over an area and see a tooltip with a corresponding id=\"tooltip\" which displays more information about the area", () => {
        let tooltip = document.querySelector("#tooltip");

        if (!tooltip || tooltip.style.display === "none") return false;

        return true;
    });

    it("should have in the tooltip a data-year property that corresponds to the data-year of the active area", () => {
        let tooltip = document.querySelector("#tooltip");
        
        return tooltip.dataset.year == cell.dataset.year;
    });

    cell.dispatchEvent(mLeave);
});

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }