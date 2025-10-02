import net from 'net';

/**
 * SMTP validation check
 * Attempts to verify if mailbox exists by connecting to SMTP server
 * Note: Many servers block this check for privacy/security reasons
 *
 * @param {string} email - The email address to verify
 * @param {string} domain - The domain of the email
 * @param {Array} mxRecords - MX records from checkMxRecords()
 */
export async function checkSmtp(email, domain, mxRecords) {
  try {
    // Use the passed MX records (no duplicate DNS lookup)
    if (!mxRecords || mxRecords.length === 0) {
      return false;
    }

    // Sort by priority (lower number = higher priority)
    const sortedMx = mxRecords.sort((a, b) => a.priority - b.priority);

    // Try connecting to each MX server until one succeeds
    for (const mx of sortedMx.slice(0, 3)) { // Try first 3 MX servers
      try {
        const result = await verifySMTP(mx.exchange, email, domain);
        if (result !== false && result !== null) {
          return result;
        }
      } catch (err) {
        // Try next MX server
        continue;
      }
    }

    return false;
  } catch (error) {
    // Fail gracefully on any error
    return false;
  }
}

/**
 * Verify email via SMTP connection
 * Returns true if mailbox exists, false if not, null if uncertain
 */
async function verifySMTP(mxHost, email, domain) {
  return new Promise((resolve) => {
    const socket = net.createConnection(25, mxHost);
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(null);
    }, 10000); // 10 second timeout

    let step = 0;
    let buffer = '';

    const cleanup = () => {
      clearTimeout(timeout);
      socket.destroy();
    };

    socket.on('data', (data) => {
      buffer += data.toString();

      // Process complete lines (ending with \r\n)
      const lines = buffer.split('\r\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const code = parseInt(line.substring(0, 3));

        // Connection greeting
        if (step === 0 && code === 220) {
          step = 1;
          socket.write(`HELO ${domain}\r\n`);
        }
        // HELO response
        else if (step === 1 && code === 250) {
          step = 2;
          socket.write(`MAIL FROM:<verify@${domain}>\r\n`);
        }
        // MAIL FROM response
        else if (step === 2 && code === 250) {
          step = 3;
          socket.write(`RCPT TO:<${email}>\r\n`);
        }
        // RCPT TO response - this tells us if mailbox exists
        else if (step === 3) {
          cleanup();
          if (code === 250 || code === 251) {
            // Mailbox exists
            resolve(true);
          } else if (code === 550 || code === 551 || code === 553 || code === 554) {
            // Mailbox doesn't exist
            resolve(false);
          } else {
            // Uncertain - server doesn't allow verification
            resolve(null);
          }
          return;
        }
        // Error at any step
        else if (code >= 400) {
          cleanup();
          resolve(null);
          return;
        }
      }
    });

    socket.on('error', (error) => {
      cleanup();
      resolve(null);
      console.log('SMTP connection error:', error);
    });

    socket.on('timeout', () => {
      cleanup();
      resolve(null);
    });

    socket.on('close', () => {
      cleanup();
      resolve(null);
    });
  });
}
