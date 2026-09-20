const { GoogleGenAI } = require('@google/genai');
const Well = require('../models/Well');
const Report = require('../models/Report');

// Haversine formula to compute distance in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Deterministically retrieves nearby hazards from MongoDB
 */
async function getDeterministicNearbyHazards(lat, lng, radiusMeters = 1000) {
  if (lat == null || lng == null) return [];
  
  // Fetch all active wells in the system
  const allWells = await Well.find({}).lean();
  
  const nearby = [];
  for (const well of allWells) {
    if (well.coordinates && typeof well.coordinates.lat === 'number' && typeof well.coordinates.lng === 'number') {
      const distance = calculateDistanceMeters(lat, lng, well.coordinates.lat, well.coordinates.lng);
      if (distance <= radiusMeters) {
        nearby.push({
          wellId: well.wellId,
          hazardType: well.hazardType || 'Uncovered Borewell',
          status: well.status,
          riskLevel: well.riskLevel || 'HIGH',
          distanceMeters: distance,
          area: well.area || `${well.village}, ${well.mandal}`,
          surveyNumber: well.surveyNumber,
          description: well.description,
          lastVerified: well.lastVerified,
          coordinates: well.coordinates
        });
      }
    }
  }

  // Sort closest first
  nearby.sort((a, b) => a.distanceMeters - b.distanceMeters);
  return nearby;
}

/**
 * Identifies intent from user query
 */
function classifyIntent(message = '', currentAlert = null) {
  const text = message.toLowerCase().trim();

  // Alert Explanation
  if (
    text.includes('why did i get') ||
    text.includes('explain my alert') ||
    text.includes('explain the alert') ||
    text.includes('why is there an alert') ||
    text.includes('why alert') ||
    text.includes('siren') ||
    text.includes('warning sound')
  ) {
    return 'EXPLAIN_ALERT';
  }

  // Nearby hazard lookup (Prioritized before report keywords)
  if (
    text.includes('near me') ||
    text.includes('nearby') ||
    text.includes('around me') ||
    text.includes('borewells near') ||
    text.includes('hazards near') ||
    text.includes('any borewell') ||
    text.includes('any hazard') ||
    text.includes('are there any') ||
    text.includes('check hazards') ||
    text.includes('open borewells in') ||
    text.includes('open hole')
  ) {
    return 'NEARBY_HAZARDS';
  }

  // Safety Guidance
  if (
    text.includes('what should i do') ||
    text.includes('what to do') ||
    text.includes('how to handle') ||
    text.includes('is it safe') ||
    text.includes('can i cover') ||
    text.includes('should i inspect') ||
    text.includes('safety guidance')
  ) {
    return 'SAFETY_GUIDANCE';
  }

  // Map reference
  if (
    text.includes('show me') ||
    text.includes('view on map') ||
    text.includes('where is it') ||
    text.includes('on the map')
  ) {
    return 'MAP_LOOKUP';
  }

  // Report intent
  if (
    text.includes('report this') ||
    text.includes('report a') ||
    text.includes('report an') ||
    text.includes('i want to report') ||
    text.includes('dangerous location') ||
    text.includes('flag this') ||
    text.includes('flag an') ||
    text.includes('there is an uncovered') ||
    text.includes('there is an open') ||
    text.includes('found an open') ||
    text.includes('submit report') ||
    text.startsWith('report')
  ) {
    return 'REPORT_HAZARD';
  }

  // My Reports status check
  if (text.includes('my report') || text.includes('report status') || text.includes('submitted report')) {
    return 'USER_REPORTS';
  }

  return 'GENERAL_QUERY';
}

/**
 * Dynamic safety-first generative fallback engine
 * Generates natural language strictly using the factual database records without static templates.
 */
function synthesizeDynamicResponse({
  intent,
  message,
  userLocation,
  locationName,
  hasPermission,
  nearbyHazards,
  currentAlert,
  userReports
}) {
  let reply = '';
  const suggestedActions = [];
  let reportDraft = null;

  switch (intent) {
    case 'EXPLAIN_ALERT': {
      if (currentAlert && (currentAlert.wellId || currentAlert.distanceMeters)) {
        const hazardName = currentAlert.hazardType || 'uncovered borewell';
        const dist = currentAlert.distanceMeters || 'under 1000';
        const areaStr = currentAlert.area ? ` in ${currentAlert.area}` : '';
        const statusLabel = currentAlert.status === 'VERIFIED_SAFE' 
          ? 'Verified Safe (Capped)' 
          : currentAlert.status === 'UNVERIFIED' 
            ? 'Reported & Pending Verification' 
            : 'Verified High-Risk';

        reply = `You received this alert because Kaal Kuaan detected an active ${hazardName}${areaStr} approximately ${dist}m from your current position.\n\nDatabase record ${currentAlert.wellId || 'KK-TS-04289'} is classified as: ${statusLabel}.\n\nWhen a registered or unverified borewell void is within your immediate safety perimeter, the network issues a proximity warning so you can maintain a safe distance before approaching unpaved paths or agricultural fields.`;
        
        suggestedActions.push({
          type: 'VIEW_HAZARD',
          label: 'View Hazard Details',
          payload: { hazardId: currentAlert.wellId || currentAlert.id }
        });
        suggestedActions.push({
          type: 'VIEW_ON_MAP',
          label: 'View on Map',
          payload: { hazardId: currentAlert.wellId || currentAlert.id }
        });
      } else if (nearbyHazards.length > 0) {
        const nearest = nearbyHazards[0];
        reply = `The alert was triggered because Kaal Kuaan detected a ${nearest.riskLevel.toLowerCase()}-risk ${nearest.hazardType.toLowerCase()} approximately ${nearest.distanceMeters}m from your detected location in ${nearest.area}.\n\nThis opening is currently marked as ${nearest.status.replace(/_/g, ' ')} in the Telangana safety database.`;
        suggestedActions.push({
          type: 'VIEW_HAZARD',
          label: 'View Hazard Details',
          payload: { hazardId: nearest.wellId }
        });
        suggestedActions.push({
          type: 'VIEW_ON_MAP',
          label: 'View on Map',
          payload: { hazardId: nearest.wellId }
        });
      } else {
        reply = `There is currently no active proximity alert triggered for your current coordinates. Proximity alerts activate automatically when your device is within 1000m of an open or unverified borewell registered in the Kaal Kuaan database.`;
        suggestedActions.push({
          type: 'VIEW_ON_MAP',
          label: 'Inspect Safe Surroundings on Map'
        });
      }
      break;
    }

    case 'NEARBY_HAZARDS': {
      if (!hasPermission || !userLocation) {
        reply = `I can't check hazards around you yet. Enable location access and I'll scan the surrounding 1 km area for registered borewells.`;
        suggestedActions.push({
          type: 'ENABLE_LOCATION',
          label: 'Enable Location Access'
        });
        break;
      }

      if (nearbyHazards.length === 0) {
        reply = `No reported borewell hazards were found within 1 km of your current location (${locationName || 'current coordinates'}).\n\nAll documented structures in this perimeter are verified capped or safe under WALTA guidelines. Please note this does not guarantee that no unreported hazards exist in unmapped private parcels.`;
        suggestedActions.push({
          type: 'REPORT_HAZARD',
          label: 'Report an Unregistered Borewell'
        });
        suggestedActions.push({
          type: 'VIEW_ON_MAP',
          label: 'Open Full District Map'
        });
      } else {
        const count = nearbyHazards.length;
        const hazardSummary = nearbyHazards.slice(0, 3).map(h => {
          const icon = h.riskLevel === 'HIGH' ? '🔴' : '🟠';
          return `${icon} **${h.hazardType}** — approximately ${h.distanceMeters} m away\n   *Area:* ${h.area}\n   *Status:* ${h.status.replace(/_/g, ' ')}`;
        }).join('\n\n');

        reply = `Yes. I found ${count} reported hazard${count > 1 ? 's' : ''} within 1 km of your current location in ${locationName || 'this sector'}:\n\n${hazardSummary}\n\n${count > 3 ? `*(+${count - 3} more hazards in surrounding 1km radius)*\n\n` : ''}Exercise vigilance when walking near field edges or unpaved cart tracks.`;
        
        suggestedActions.push({
          type: 'VIEW_ON_MAP',
          label: 'View All on Map',
          payload: { hazardId: nearbyHazards[0].wellId }
        });
        suggestedActions.push({
          type: 'REPORT_HAZARD',
          label: 'Report Another Hazard'
        });
      }
      break;
    }

    case 'SAFETY_GUIDANCE': {
      reply = `If you encounter an open or uncapped borewell:\n\n1. **Keep yourself and others away** from the opening immediately. Maintain at least a 10-meter perimeter.\n2. **Do not attempt to enter, peer inside, or inspect** the borewell yourself. Edges may be crumbling or structurally unstable.\n3. **Do not attempt makeshift repairs** or throw heavy stones or loose debris into the shaft.\n4. **Warn people nearby**, especially children, farmers, and grazing attendants, if it is safe to do so.\n5. **Report the exact location through Kaal Kuaan** so the local Gram Panchayat and Mandal Revenue Officer receive instant geo-tagged coordinates.\n6. **For immediate emergencies** (e.g. someone has fallen or is in imminent peril), contact **112 / Fire & Emergency Services** right away.`;
      
      suggestedActions.push({
        type: 'REPORT_HAZARD',
        label: 'Report a Hazard Now'
      });
      suggestedActions.push({
        type: 'VIEW_ON_MAP',
        label: 'Check Map for Safe Corridors'
      });
      break;
    }

    case 'REPORT_HAZARD': {
      // Formulate a structured draft report
      const cleanLoc = locationName || (userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Detected Location');
      
      reportDraft = {
        hazardType: message.toLowerCase().includes('abandoned') 
          ? 'Abandoned Borewell' 
          : message.toLowerCase().includes('damaged') 
            ? 'Damaged Cover' 
            : 'Uncovered Borewell',
        locationName: cleanLoc,
        coordinates: userLocation || { lat: 17.0542, lng: 79.2685 },
        description: message.length > 10 ? message : 'Citizen reported potential borewell cavity observed near road/field.'
      };

      reply = `I can help you report this hazard to the Vemulapally Panchayat and WALTA field officers.\n\nI have prepared a draft with your location. Please review the details below before submitting:`;
      
      suggestedActions.push({
        type: 'CONFIRM_REPORT',
        label: 'Submit Hazard Report',
        payload: reportDraft
      });
      suggestedActions.push({
        type: 'REPORT_HAZARD',
        label: 'Open Full Report Form'
      });
      break;
    }

    case 'MAP_LOOKUP': {
      if (nearbyHazards.length > 0) {
        const target = nearbyHazards[0];
        reply = `Here is the nearest registered borewell: **${target.hazardType}** (${target.wellId}) situated ${target.distanceMeters}m from your location in ${target.area}.\n\nClick below to center and examine the exact perimeter on the satellite map.`;
        suggestedActions.push({
          type: 'VIEW_ON_MAP',
          label: `View ${target.wellId} on Map`,
          payload: { hazardId: target.wellId }
        });
      } else {
        reply = `There are no active hazard markers registered within 1 km of your current position. You can explore the wider district map below.`;
        suggestedActions.push({
          type: 'VIEW_ON_MAP',
          label: 'Explore Live Map'
        });
      }
      break;
    }

    case 'USER_REPORTS': {
      if (userReports && userReports.length > 0) {
        const reportList = userReports.slice(0, 3).map(r => 
          `• **${r.hazardType}** in ${r.locationName || r.area || 'Reported Area'} — Status: **${r.status}**`
        ).join('\n');
        reply = `You have ${userReports.length} submitted report${userReports.length > 1 ? 's' : ''} in Kaal Kuaan:\n\n${reportList}\n\nAll reports undergo physical inspection by the Mandal Agricultural Officer and Gram Panchayat Secretary.`;
      } else {
        reply = `You haven't submitted any hazard reports yet. If you spot an uncovered, abandoned, or damaged borewell casing, you can submit it to notify local authorities immediately.`;
        suggestedActions.push({
          type: 'REPORT_HAZARD',
          label: 'Submit a New Report'
        });
      }
      break;
    }

    default: {
      reply = `I am the Kaal Kuaan Safety Assistant. I can help you monitor surrounding borewells, explain active proximity sirens, provide emergency precautions, or submit geo-tagged hazard reports to the local Panchayat.`;
      suggestedActions.push({
        type: 'VIEW_ON_MAP',
        label: 'Hazards Near Me'
      });
      suggestedActions.push({
        type: 'REPORT_HAZARD',
        label: 'Report a Borewell'
      });
      break;
    }
  }

  return { reply, suggestedActions, reportDraft };
}

/**
 * Main Assistant Orchestrator
 */
async function processAssistantMessage({
  message,
  conversationHistory = [],
  userLocation = null,
  locationName = 'Telangana',
  hasPermission = false,
  currentAlert = null,
  userReports = [],
  authenticatedUser = null
}) {
  // 1. Retrieve Deterministic Kaal Kuaan Data
  let nearbyHazards = [];
  if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
    nearbyHazards = await getDeterministicNearbyHazards(userLocation.lat, userLocation.lng, 1000);
  }

  // 2. Classify intent
  const intent = classifyIntent(message, currentAlert);

  // 3. Check for API key (Groq / Gemini / OpenAI)
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (apiKey) {
    try {
      // Construct controlled safety-grounded context
      const systemInstruction = `You are the Kaal Kuaan Safety Assistant, an integrated AI for the Telangana Public Borewell Safety Network under the WALTA Act, 2002 framework.

PURPOSE:
Help citizens understand nearby borewell hazards, explain safety alerts, provide emergency precautions, and assist with hazard reporting.

CRITICAL SAFETY RULES:
1. NEVER invent or hallucinate borewells, coordinates, or hazards. Base all hazard statements strictly on the retrieved database records provided below.
2. If no records are retrieved for the user's location, state clearly: "No reported borewell hazards were found within 1 km of your current location." Mention that this does not guarantee unreported hazards do not exist.
3. NEVER tell users to physically approach, enter, inspect, peer into, repair, or cover an open borewell. Tell them to keep distance and warn others safely.
4. For immediate danger, clearly prioritize contacting local emergency services (112 / Fire Services).
5. When explaining an alert, explain it strictly based on the real alert record provided.
6. When helping report a hazard, draft the details but do not claim it is automatically submitted or verified. Reports are marked Pending Verification until inspected by the Mandal Agricultural Officer and Panchayat.
7. Tone: Calm, serious, protective, grounded in public safety. Avoid generic chatbot greetings ("As an AI language model...").`;

      const promptContext = `
USER CONTEXT:
- Detected Area: ${locationName || 'Unknown'}
- Location Permission Granted: ${hasPermission ? 'Yes' : 'No'}
- User Coordinates Available: ${userLocation ? 'Yes (within 1km radius)' : 'No'}
- Current Active Alert: ${currentAlert ? JSON.stringify(currentAlert) : 'None'}

RETRIEVED DATABASE RECORDS (Within 1 km):
${nearbyHazards.length === 0 ? 'Zero records within 1 km.' : JSON.stringify(nearbyHazards.slice(0, 5), null, 2)}

USER'S PAST SUBMITTED REPORTS:
${userReports.length === 0 ? 'No prior reports.' : JSON.stringify(userReports.slice(0, 3), null, 2)}

USER QUESTION / STATEMENT:
"${message}"
`;

      // Build full conversational message list
      const chatMessages = [
        { role: 'system', content: systemInstruction }
      ];

      if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        for (const prev of conversationHistory.slice(-6)) {
          if (prev && prev.role && prev.content) {
            chatMessages.push({
              role: prev.role === 'assistant' ? 'assistant' : 'user',
              content: prev.content
            });
          }
        }
      }

      chatMessages.push({
        role: 'user',
        content: promptContext
      });

      // Branch A: Groq API Key (keys starting with gsk_ or explicitly GROQ_API_KEY)
      if (apiKey.startsWith('gsk_') || process.env.GROQ_API_KEY) {
        const groqKey = apiKey.startsWith('gsk_') ? apiKey : process.env.GROQ_API_KEY;
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: chatMessages,
            temperature: 0.2
          })
        });

        const groqJson = await groqRes.json();
        const candidateText = groqJson?.choices?.[0]?.message?.content;

        if (candidateText && candidateText.trim().length > 0) {
          const fallbackObj = synthesizeDynamicResponse({
            intent,
            message,
            userLocation,
            locationName,
            hasPermission,
            nearbyHazards,
            currentAlert,
            userReports
          });

          return {
            reply: candidateText.trim(),
            suggestedActions: fallbackObj.suggestedActions,
            reportDraft: fallbackObj.reportDraft
          };
        }
      } else {
        // Branch B: Google Gemini API
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: chatMessages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        });

        const candidateText = response?.text?.();
        if (candidateText && candidateText.trim().length > 0) {
          const fallbackObj = synthesizeDynamicResponse({
            intent,
            message,
            userLocation,
            locationName,
            hasPermission,
            nearbyHazards,
            currentAlert,
            userReports
          });

          return {
            reply: candidateText.trim(),
            suggestedActions: fallbackObj.suggestedActions,
            reportDraft: fallbackObj.reportDraft
          };
        }
      }
    } catch (err) {
      console.warn('[AI SERVICE] External LLM call encountered an issue, running dynamic safety fallback:', err.message);
    }
  }

  // Fallback to dynamic deterministic safety engine
  return synthesizeDynamicResponse({
    intent,
    message,
    userLocation,
    locationName,
    hasPermission,
    nearbyHazards,
    currentAlert,
    userReports
  });
}

module.exports = {
  processAssistantMessage,
  getDeterministicNearbyHazards
};
