const announcementsListDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("announcements-list")
);
const totalSpentSpan = /** @type {HTMLSpanElement} */ (
  document.getElementById("total-spent")
);
const monthlyChartDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("monthly-chart")
);
const enabledStoresSpan = /** @type {HTMLSpanElement} */ (
  document.getElementById("enabled-stores")
);
const activeProfilesSpan = /** @type {HTMLSpanElement} */ (
  document.getElementById("active-profiles")
);
const totalSuccessesSpan = /** @type {HTMLSpanElement} */ (
  document.getElementById("total-successes")
);
const totalDeclinesSpan = /** @type {HTMLSpanElement} */ (
  document.getElementById("total-declines")
);
const announcementTemplate = /** @type {HTMLTemplateElement} */ (
  document.getElementById("announcement-template")
);

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const monthlyApexChart = new ApexCharts(monthlyChartDiv, {
  chart: {
    height: "100%",
    sparkline: {
      enabled: true,
    },
    type: "area",
    width: "100%",
  },
  colors: ["#4cd137"],
  series: [
    {
      name: "Spent",
      data: [],
    },
  ],
  tooltip: {
    x: {
      format: "dd MMM yyyy",
    },
  },
  xaxis: {
    type: "datetime",
  },
  yaxis: {
    labels: {
      formatter: (value) => currencyFormatter.format(value),
    },
  },
});

monthlyApexChart.render();

/**
 * Renders each announcement in sequential order onto the announcements list.
 * @param {Announcement[]} announcements - Array of the user's announcements.
 */
export function appendAnnouncementsToList(announcements) {
  announcementsListDiv.replaceChildren(
    ...announcements.map(({ lines, theme, title }) => {
      const templateNode = announcementTemplate.content.cloneNode(true);

      if (templateNode instanceof DocumentFragment) {
        const announcementElement = templateNode.getElementById("announcement");
        const titleElement = templateNode.getElementById("announcement-title");
        const messageElement = templateNode.getElementById(
          "announcement-message"
        );

        announcementElement.classList.add(`announcement--${theme}`);
        titleElement.textContent = title;
        messageElement.innerHTML = lines.join("<br />");
      }

      return templateNode;
    })
  );
}

/**
 * Updates the total amount of money the user has spent.
 * @param {number} totalSpent
 */
export function updateTotalSpent(totalSpent) {
  totalSpentSpan.textContent = currencyFormatter.format(totalSpent);
}

/**
 * Update the monthly-spent ApexChart series array overriding the existing one.
 * @param {ApexAxisChartSeries | ApexNonAxisChartSeries} newSeries - Series
 * array to override the existing one
 */
export function updateMonthlyApexChartSeries(newSeries) {
  monthlyApexChart.updateSeries(newSeries);
}

/**
 * Updates the amount of enabled stores displayed.
 * @param {number} enabledStores - Number of stores that have autofill or
 * autocheckout enabled.
 */
export function updateEnabledStores(enabledStores) {
  enabledStoresSpan.textContent = enabledStores.toString();
}

/**
 * Updates the amount of active profiles displayed.
 * @param {number} activeProfiles - Number of profiles the user has created.
 */
export function updateActiveProfiles(activeProfiles) {
  activeProfilesSpan.textContent = activeProfiles.toString();
}

/**
 * Updates the amount of successful checkouts displayed.
 * @param {number} successfulCheckouts - Number of checkouts that have been
 * successfully processed.
 */
export function updateSuccessfulCheckouts(successfulCheckouts) {
  totalSuccessesSpan.textContent = successfulCheckouts.toString();
}

/**
 * Updates the amount of declines checkouts displayed.
 * @param {number} declinedCheckouts - Number of checkouts that have been
 * declined.
 */
export function updateDeclinedCheckouts(declinedCheckouts) {
  totalDeclinesSpan.textContent = declinedCheckouts.toString();
}
