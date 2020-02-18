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