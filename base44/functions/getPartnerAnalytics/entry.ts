import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get Google Analytics access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_analytics');
    
    // Get all partners to map slugs to names
    const partners = await base44.entities.Partner.list();
    const partnerSlugMap = {};
    partners.forEach(p => {
      partnerSlugMap[p.slug] = { id: p.id, name: p.name };
    });

    // Fetch Google Analytics property ID
    const propertiesResponse = await fetch(
      'https://analyticsadmin.googleapis.com/v1/properties',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!propertiesResponse.ok) {
      throw new Error('Failed to fetch GA properties');
    }
    
    const propertiesData = await propertiesResponse.json();
    const property = propertiesData.properties?.[0];
    
    if (!property) {
      return Response.json({ error: 'No Google Analytics property found' }, { status: 404 });
    }
    
    // Extract property ID from resource name (e.g., "properties/123456789")
    const propertyId = property.name.split('/')[1];
    
    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Build event name filter for partner page views
    // Assuming partner pages have pattern like /partner/:slug
    const runReportUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
    
    const reportResponse = await fetch(runReportUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        }],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' },
        ],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'eventCount' },
          { name: 'activeUsers' },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: {
              matchType: 'PARTIAL_REGEXP',
              value: '^/partner/',
            },
          },
        },
      }),
    });
    
    if (!reportResponse.ok) {
      throw new Error('Failed to fetch analytics report');
    }
    
    const reportData = await reportResponse.json();
    
    // Process and aggregate data by partner
    const partnerAnalytics = {};
    
    if (reportData.rows) {
      reportData.rows.forEach(row => {
        const pagePath = row.dimensionValues?.[0]?.value || '';
        const pageTitle = row.dimensionValues?.[1]?.value || '';
        const pageViews = parseInt(row.metricValues?.[0]?.value || '0');
        const events = parseInt(row.metricValues?.[1]?.value || '0');
        const users = parseInt(row.metricValues?.[2]?.value || '0');
        
        // Extract slug from path like /partner/slug
        const slug = pagePath.replace('/partner/', '').replace(/\/$/, '');
        
        if (partnerSlugMap[slug]) {
          const partner = partnerSlugMap[slug];
          if (!partnerAnalytics[partner.id]) {
            partnerAnalytics[partner.id] = {
              partner_id: partner.id,
              partner_name: partner.name,
              slug: slug,
              total_page_views: 0,
              total_events: 0,
              total_users: 0,
            };
          }
          partnerAnalytics[partner.id].total_page_views += pageViews;
          partnerAnalytics[partner.id].total_events += events;
          partnerAnalytics[partner.id].total_users += users;
        }
      });
    }
    
    // Convert to array and sort by page views
    const analyticsArray = Object.values(partnerAnalytics).sort(
      (a, b) => b.total_page_views - a.total_page_views
    );
    
    return Response.json({ 
      success: true,
      data: analyticsArray,
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});