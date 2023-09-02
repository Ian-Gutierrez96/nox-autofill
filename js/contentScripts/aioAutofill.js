"use strict";

(async () => {
  const {
    profiles,
    scripts: {
      aioAutofill: { enabled, mode, profileKey },
    },
    settings: { blacklistedSites },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    Object.hasOwn(profiles, profileKey) &&
    enabled
  ) {
    const { billing, contact, payment } = profiles[profileKey];
    const fields = [
      { regExp: /e.?mail/im, value: contact.email },
      { regExp: /phone|mobile|contact.?number/im, value: contact.tel },
      { regExp: /country|countries/im, value: billing.country },
      {
        regExp: /first.*name|initials|f[_-]?name|first$|given.*name/im,
        value: billing.givenName,
      },
      {
        regExp:
          /last.*name|l[_-]?name|surname(?!\d)|last$|secondname|family.*name/im,
        value: billing.familyName,
      },
      {
        regExp:
          /address[_-]?level(?:1|one)|(?<!(?:united|hist|history).?)state|county|region|province|county|principality/im,
        value: billing.addressLevel1,
      },
      {
        regExp: /address[_-]?level(?:2|two)|city|town/im,
        value: billing.addressLevel2,
      },
      {
        regExp: /address[_-]?line(?:1|one)|^address$|address1|addr1|street/im,
        value: billing.addressLine1,
      },
      {
        regExp: /address[_-]?line(?:2|two)|address2|addr2|suite|unit/im,
        value: billing.addressLine2,
      },
      {
        regExp: /(?<!\.)zip|postal|post.*code|pcode/im,
        value: billing.postalCode,
      },
      {
        regExp:
          /card.?(?:holder|owner)|name.*(?:\b)?on(?:\b)?.*card|(?:card|cc).?name|cc.?full.?name/im,
        value: payment.ccGivenName + " " + payment.ccFamilyName,
      },
      {
        regExp:
          /(?:add)?(?:card|cc|acct|account).?(?:number|#|no|num|field|pan)/im,
        value: payment.ccNumber,
      },
      {
        regExp:
          /verification|card.?identification|security.?code|card.?code|security.?value|security.?number|(cvn|cvv|cvc|csc|cvd|cid|ccv)(field)?/im,
        value: payment.ccCSC,
      },
      {
        regExp: /exp.*mo|exp.*date|ccmonth|cardmonth|addmonth/im,
        value: payment.ccExpMonth.padStart(2, "0"),
      },
      { regExp: /exp.*year|(?:add)?year/im, value: "20" + payment.ccExpYear },
      {
        regExp: /(?:mm\s*[-/]?\s*)yy(?:[^y]|$)/im,
        value: payment.ccExpMonth.padStart(2, "0") + "/" + payment.ccExpYear,
      },
      {
        regExp: /exp.*date[^y\n\r]*|(?:mm\s*[-/]?\s*)yyyy(?:[^y]|$)/im,
        value: payment.ccExpMonth.padStart(2, "0") + "/20" + payment.ccExpYear,
      },
      {
        regExp:
          /^name|full.?name|your.?name|customer.?name|bill.?name|name.*first.*last|contact.?(?:name|person)/im,
        value: billing.givenName + " " + billing.familyName,
      },
    ];

    document
      .querySelectorAll(
        "input:not([type='hidden'], [tabindex='-1']), select:not([type='hidden'], [tabindex='-1'])"
      )
      .forEach(autofillAIOElement);

    new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            node
              .querySelectorAll(
                "input:not([type='hidden'], [tabindex='-1']), select:not([type='hidden'], [tabindex='-1'])"
              )
              .forEach(autofillAIOElement);
          }
        });
      });
    }).observe(document, {
      childList: true,
      subtree: true,
    });

    async function autofillAIOElement(element) {
      if (element instanceof HTMLElement) {
        const field = fields.find((field) =>
          field.regExp.test(
            element
              .getAttributeNames()
              .filter((attributeName) => attributeName !== "style")
              .map((qualifiedName) => element.getAttribute(qualifiedName))
              .join("\n")
          )
        );

        if (field) {
          await autofillHTMLElement(element, field.value, mode);
        }
      }
    }
  }
})();
