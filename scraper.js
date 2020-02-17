const puppeteer = require("puppeteer");
const fs = require("fs");

// URL to be scraped
let URL =
  "https://pathwaysguide.universityofcalifornia.edu/college-pathways/0/0";

// Open the above URL in a browser's new page
const ping = async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 926 });
    await page.goto(URL);
    return { page, browser };
  } catch (error) {
    console.log(error);
  }
};

// Evaluate & scrape
const scrapeOptions = async () => {
  try {
    let { page, browser } = await ping();

    let selectItem = await page.evaluate(async () => {
      let collegesArr = [];
      let pathwaysArr = [];

      let collegeEles = await document.querySelectorAll(
        "select[id='collegeSelect'] > option"
      );
      let pathwayEles = await document.querySelectorAll(
        "select[id='pathwaySelect'] > option"
      );

      collegeEles.forEach(collegeEle => {
        if (collegeEle.value + "") collegesArr.push(collegeEle.value);
        collegesArr = Array.from(new Set(collegesArr));
      });
      pathwayEles.forEach(pathwayEle => {
        if (pathwayEle.value + "") pathwaysArr.push(pathwayEle.text);
        pathwaysArr = Array.from(new Set(pathwaysArr));
      });

      let select = {
        colleges: collegesArr,
        pathways: pathwaysArr
      };

      return select;
    });

    console.log(selectItem);

    return { page, browser, selectItem };
  } catch (error) {
    console.log(error);
  }
};

const scrapeDetails = async () => {
  const { page, browser, selectItem } = await scrapeOptions();

  let collegesArr = selectItem.colleges;
  let pathwaysArr = selectItem.pathways;

  // To save the course details of multiple colleges with multiple pathways
  let colleges_coursesRows = [];

  collegesArr.forEach(async college => {
    // console.log(college);
    // To save the course details of one college with multiple pathways
    let college_coursesRows = [];
    try {
      await page.select("#collegeSelect", college);
      pathwaysArr.forEach(async pathway => {
        await page.select("#pathwaySelect", pathway);
        // Start scraping data for each dropdown combination
        let courseRows = await page.evaluate(async () => {
          // Contains extracted rows
          let courseRowArr = [];
          // Extract all the course rows which are without empty fields
          courses_without_empty_fields_Eles = document.querySelectorAll(
            "div[class='row expectation multi-seg']"
          );
          // Loop to extract data from all the rows
          courses_without_empty_fields_Eles.forEach(courseEle => {
            let courseDetail = {};
            let courses = [];
            try {
              // Extract Course Expectation
              courseDetail.college = college;
              courseDetail.pathway = pathway;
              courseDetail.course_expectation = courseEle.querySelector(
                "div[class='col-md-4'] > b"
              ).textContent;
              // Check the prescence of Course with border
              let cou_couTit_with_border_eles = courseEle.querySelector(
                "div[class='col-md-8'] > div[class='col-md-12 segborder']"
              );
              if (cou_couTit_with_border_eles != null) {
                cou_couTit_with_border_eles.forEach(
                  cou_couTit_with_border_ele => {
                    // Extract Course Key
                    let key = cou_couTit_with_border_ele.querySelectorAll(
                      "div[class='col-md-6']"
                    )[0].innerText;
                    // Extract Course Title
                    let title = cou_couTit_with_border_ele.querySelectorAll(
                      "div[class='col-md-6']"
                    )[1].innerText;
                    let course = {
                      course_key: key,
                      course_title: title
                    };
                    courses.push(course);
                  }
                );
              }
              // Extract the Course without border(only one)
              let cou_couTit_without_border_ele = courseEle.querySelector(
                "div[class='col-md-8'] > div[class='col-md-12']"
              );
              // Extract Course Key
              let key = cou_couTit_without_border_ele.querySelectorAll(
                "div[class='col-md-6']"
              )[0].innerText;
              // Extract Course Title
              let title = cou_couTit_without_border_ele.querySelectorAll(
                "div[class='col-md-6']"
              )[1].innerText;
              let course = {
                course_key: key,
                course_title: title
              };
              courses.push(course);
              courseDetail.courses = courses;
            } catch (error) {
              console.log(error);
            }
            courseRowArr.push(courseDetail);
          });
          // Extract all the course rows which are with empty fields
          courses_with_empty_fields_Eles = await document.querySelectorAll(
            "div[class='row expectation']"
          );
          // Loop to extract data from all the rows
          if (courses_with_empty_fields_Eles != null) {
            course_note =
              "There aren’t courses at your college that articulate at all UC campuses. However, courses at your college may fulfill this Pathway course expectation at some UC campuses. Check ASSIST to find courses that will prepare you for your major at specific UC campuses.";
            courses_with_empty_fields_Eles.forEach(async courseEle => {
              let courseDetail = {};
              let courses = [];
              try {
                // Extract Course Expectation
                courseDetail.college = college;
                courseDetail.pathway = pathway;
                courseDetail.course_expectation = await courseEle.querySelector(
                  "div[class='col-md-4'] > b"
                ).textContent;
                courseDetail.courses = course_note;
                courseRowArr.push(courseDetail);
              } catch (error) {
                console.log(error);
              }
            });
          }
          // courseRowArr.push("hi");
          return courseRowArr;
        });
        college_coursesRows.push(courseRows);
      });
    } catch (error) {
      console.log(error);
    }

    colleges_coursesRows.push(college_coursesRows);
  });

  console.log(colleges_coursesRows);
  // Write json values in a json file
  let data = JSON.stringify(colleges_coursesRows);
  fs.writeFileSync("course.json", data);

  // await browser.close();
};

scrapeDetails();

// {
//   cou_expect: "",
//   cou:[{
//     cou_nam: "",
//     cou_tit: ""
//   }]
// }
