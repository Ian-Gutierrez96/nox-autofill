import * as announcementsModel from "../models/announcementsModel.js";
import * as checkoutsModel from "../models/checkoutsModel.js";
import * as profilesModel from "../models/profilesModel.js";
import * as scriptsModel from "../models/scriptsModel.js";
import * as homeView from "../views/homeView.js";

const CURRENT_DATE = new Date();

controlAnnouncementsToList();
controlTotalSpent();
controlMonthlyApexChartSeries();
controlEnabledStores();
controlActiveProfiles();
controlSuccessfulCheckouts();
controlDeclinedCheckouts();

/**
 * Append each announcement stored in state onto the list.
 */
function controlAnnouncementsToList() {
  homeView.appendAnnouncementsToList(announcementsModel.state);
}

/**
 * Iterate through each checkout and accumulate the amount of money spent on
 * each successful checkout, and then render the sum.
 */
function controlTotalSpent() {
  homeView.updateTotalSpent(
    checkoutsModel.state.reduce(
      (totalSpent, { productPrice, wasSuccessful }) =>
        wasSuccessful ? totalSpent + productPrice : totalSpent,
      0
    )
  );
}

/**
 * Update the monthly ApexChart's series by creating an array for each day of
 * the month and setting it's y-axis value to the amount of money spent on that
 * day.
 */
function controlMonthlyApexChartSeries() {
  homeView.updateMonthlyApexChartSeries([
    {
      data: Array.from(
        {
          length: new Date(
            CURRENT_DATE.getFullYear(),
            CURRENT_DATE.getMonth() + 1,
            0
          ).getDate(),
        },
        (_, index) => {
          const day = new Date(
            CURRENT_DATE.getFullYear(),
            CURRENT_DATE.getMonth(),
            index + 1
          );

          return {
            x: day,
            y: checkoutsModel.state.reduce(
              (dailySpent, { productPrice, purchaseDate, wasSuccessful }) =>
                wasSuccessful &&
                new Date(purchaseDate).toDateString() === day.toDateString()
                  ? dailySpent + productPrice
                  : dailySpent,
              0
            ),
          };
        }
      ),
    },
  ]);
}

/**
 * Enumerate through each script and render the amount of scripts that either
 * have autocheckout or autofill enabled.
 */
function controlEnabledStores() {
  homeView.updateEnabledStores(
    Object.values(scriptsModel.state).filter(
      ({ autocheckoutEnabled, autofillEnabled }) =>
        autocheckoutEnabled || autofillEnabled
    ).length
  );
}

/**
 * Render the total number of active profiles as the number of profile keys
 * stored.
 */
function controlActiveProfiles() {
  homeView.updateActiveProfiles(Object.keys(profilesModel.state).length);
}

/**
 * Render the amount of successful checkouts as the number of checkouts that
 * were successful in processing.
 */
function controlSuccessfulCheckouts() {
  homeView.updateSuccessfulCheckouts(
    checkoutsModel.state.filter(({ wasSuccessful }) => wasSuccessful).length
  );
}

/**
 * Render the amount of declined checkouts as the number of checkouts that were
 * unsuccessful in processing.
 */
function controlDeclinedCheckouts() {
  homeView.updateDeclinedCheckouts(
    checkoutsModel.state.filter(({ wasSuccessful }) => !wasSuccessful).length
  );
}

announcementsModel.events.addEventListener(
  "stateChange",
  controlAnnouncementsToList
);
checkoutsModel.events.addEventListener("stateChange", controlTotalSpent);
checkoutsModel.events.addEventListener(
  "stateChange",
  controlMonthlyApexChartSeries
);
scriptsModel.events.addEventListener("stateChange", controlEnabledStores);
profilesModel.events.addEventListener("stateChange", controlActiveProfiles);
checkoutsModel.events.addEventListener(
  "stateChange",
  controlSuccessfulCheckouts
);
checkoutsModel.events.addEventListener("stateChange", controlDeclinedCheckouts);
