export async function checkDomainAge(domain) {
  try {
    // Use a WHOIS API or domain reputation service
    const response = await fetch(`https://api.apilayer.com/whois/query?domain=${domain}`, {
      headers: { 'apikey': 'YOUR_API_KEY' }
    });
    const data = await response.json();

    const createdDate = new Date(data.created_date);
    const ageInDays = (Date.now() - createdDate) / (1000 * 60 * 60 * 24);

    return {
      isNew: ageInDays < 90, // Domain less than 3 months old
      ageInDays
    };
  } catch (error) {
    return { isNew: false, ageInDays: null };
  }
}