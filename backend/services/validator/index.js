import { isFreeDomain } from './isFreeDomain.js';
import { isDisposable } from "./isDisposable.js";
import { isRoleAccount } from "./isRoleAccount.js";
import { checkMxRecords } from "./checkMxRecords.js";
import { checkDomainAge } from "./checkDomainAge.js";
import { validateSyntax } from "./validateSyntax.js";
import { hasSuspiciousPatterns } from "./hasSuspiciousPatterns.js";
import { checkSmtp } from "./checkSmtp.js";


export {
    isFreeDomain,
    isDisposable,
    isRoleAccount,
    checkMxRecords,
    checkDomainAge,
    validateSyntax,
    hasSuspiciousPatterns,
    checkSmtp,
};
