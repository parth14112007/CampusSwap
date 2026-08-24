/**
 * CampusSwap Data Models & Type Definitions
 * 
 * Scalable domain models for the CampusSwap engineering resource ecosystem.
 * Designed with Supabase-ready relational schemas and TypeScript/JSDoc validation.
 */

/**
 * @typedef {'student' | 'lab_assistant' | 'faculty' | 'admin'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique UUID of the user (maps to Supabase auth.users.id)
 * @property {string} email - College institutional email (@mit.edu)
 * @property {UserRole} role - User authorization role
 * @property {string} collegeDomain - College/university domain (e.g., mit.edu)
 * @property {boolean} isVerified - Whether student college email & ID are verified
 * @property {string} createdAt - ISO Timestamp
 * @property {string} [updatedAt] - ISO Timestamp
 * @property {string} [lastLogin] - ISO Timestamp
 */

/**
 * @typedef {Object} Profile
 * @property {string} id - Profile identifier (maps to public.profiles.id)
 * @property {string} userId - Reference to User id
 * @property {string} fullName - Student full name
 * @property {string} avatarUrl - Student profile avatar image URL
 * @property {string} studentId - University roll/student number (e.g. 22ENG048)
 * @property {string} department - Engineering Department (e.g., Robotics & Automation)
 * @property {string} yearOfStudy - Academic year (e.g. 3rd Year)
 * @property {string} campusLocationId - Reference to CampusLocation
 * @property {string} campusLocationName - Human readable campus location
 * @property {string} [bio] - Short student bio
 * @property {string} [phone] - Contact number
 * @property {number} trustScore - Platform trust rating (0.0 to 5.0)
 * @property {number} totalSwaps - Count of completed peer transactions
 * @property {Object} escrowWallet - Escrow account balances
 * @property {number} escrowWallet.available - Available INR balance
 * @property {number} escrowWallet.heldInEscrow - INR deposit currently held
 * @property {number} escrowWallet.totalEarned - Lifetime INR earned
 * @property {string[]} skills - Array of engineering skills (e.g. ['Arduino', 'PCB Design'])
 * @property {string[]} badges - Campus reputation badges
 * @property {boolean} isProfileComplete - Profile completion flag
 * @property {string} createdAt - ISO Timestamp
 * @property {string} [updatedAt] - ISO Timestamp
 */

/**
 * @typedef {'lab' | 'hostel' | 'workshop' | 'club_room' | 'fablab' | 'library'} LocationType
 */

/**
 * @typedef {Object} CampusLocation
 * @property {string} id - Unique location identifier
 * @property {string} campusName - Name of institution / campus
 * @property {string} buildingName - Building name / Block (e.g., Block B)
 * @property {string} labName - Laboratory or facility name (e.g., VLSI & Analog Lab)
 * @property {string} roomNumber - Room code (e.g., 304)
 * @property {string} floor - Floor designation
 * @property {string} [wing] - Building wing
 * @property {LocationType} type - Facility classification
 * @property {boolean} isPublic - Accessible to all students
 * @property {boolean} isAuthorizedLab - Official lab equipped with hardware inventory
 * @property {string} [managerName] - Faculty / Lab assistant in charge
 * @property {string} [contactEmail] - Lab contact email
 * @property {number} [mapX] - Stylized X coordinate (0-100%)
 * @property {number} [mapY] - Stylized Y coordinate (0-100%)
 */

/**
 * @typedef {'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE' | 'UNKNOWN'} ResourceAvailability
 */

/**
 * @typedef {Object} CampusResource
 * @property {string} id - Unique resource identifier
 * @property {string} name - Hardware resource name
 * @property {string} category - Category tag
 * @property {ResourceAvailability} availability - Standardized availability state
 * @property {string} availabilityLabel - Human friendly text (e.g. 'Available now')
 * @property {string} provider - Lab department or student provider
 * @property {string} building - Building name (e.g. 'Engineering Block')
 * @property {string} room - Room or lab code (e.g. 'Robotics Bay A')
 * @property {string} campusZone - Campus zone name
 * @property {string} locationId - Reference to CampusLocation id
 * @property {number} distanceMeters - Approximate distance in meters
 * @property {string} distanceText - E.g. '120m away'
 * @property {string} type - 'Borrow' | 'Rent' | 'Lab Access' | 'Buy'
 * @property {number} [price] - Daily rate or access fee (0 if free)
 * @property {number} rating - Resource/lab rating (0.0 - 5.0)
 * @property {boolean} isVerified - Verification status badge
 * @property {string} condition - 'Brand New' | 'Like New' | 'Good' | 'Lab Tested'
 * @property {string} description - Hardware description and lab access rules
 * @property {string} image - Photo URL
 * @property {ComponentSpecification[]} specs - Hardware specifications
 * @property {number} totalStock - Total units on campus
 * @property {number} availableStock - Units available right now
 * @property {string} [linkedListingId] - Matched peer marketplace listing ID
 * @property {string} createdAt - ISO Timestamp
 * @property {string} [updatedAt] - ISO Timestamp
 */

/**
 * @typedef {Object} ComponentSpecification
 * @property {string} label - Spec key name (e.g. 'Microcontroller')
 * @property {string} value - Spec value (e.g. 'ATmega328P')
 */

/**
 * @typedef {Object} Component
 * @property {string} id - Component catalog identifier
 * @property {string} name - Official part name
 * @property {string} category - Primary category (Microcontrollers, Sensors, etc.)
 * @property {string} [subcategory] - Secondary subcategory
 * @property {string} [manufacturer] - Brand / Manufacturer
 * @property {string} [partNumber] - MPN (Manufacturer Part Number)
 * @property {string} [datasheetUrl] - External datasheet PDF URL
 * @property {string} [pinoutDiagramUrl] - Pinout schematic image URL
 * @property {ComponentSpecification[]} specifications - Technical specifications
 * @property {string} [condition] - Hardware condition rating
 * @property {string} [packageType] - DIP, SMD, Module, etc.
 * @property {string[]} tags - Search and discovery keywords
 * @property {string} createdAt - ISO Timestamp
 */

/**
 * @typedef {'Rent' | 'Buy' | 'Borrow' | 'Donate'} ListingType
 * @typedef {'Brand New' | 'Like New' | 'Good' | 'Lab Tested' | 'Fair'} ComponentCondition
 * @typedef {'in_person' | 'lab_pickup' | 'qr_handover'} HandoverMethod
 */

/**
 * @typedef {Object} Listing
 * @property {string} id - Unique listing identifier
 * @property {string} ownerId - User ID of owner
 * @property {Object} owner - Owner snapshot details for UI performance
 * @property {string} owner.name - Owner name
 * @property {string} owner.year - Owner year of study
 * @property {string} owner.dept - Owner department
 * @property {number} owner.rating - Owner trust score
 * @property {number} owner.swapsCount - Owner swap count
 * @property {string} owner.avatar - Owner avatar URL
 * @property {boolean} owner.verified - Verified badge
 * @property {string} [componentId] - Optional link to standard Component catalog
 * @property {string} title - Listing title
 * @property {string} description - Detailed item description
 * @property {string} category - Category tag
 * @property {ListingType} type - Rent | Buy | Borrow | Donate
 * @property {number} price - Rental daily price or sale price in INR (0 for Borrow/Donate)
 * @property {string} priceUnit - '/day' | 'One-time' | 'Free Peer Borrow' | 'Free Donation'
 * @property {number} deposit - Escrow security deposit in INR
 * @property {ComponentCondition} condition - Item condition
 * @property {string} location - Human-friendly pickup location string
 * @property {string} [campusLocationId] - Reference to CampusLocation
 * @property {string} image - Primary image URL
 * @property {string[]} [galleryImages] - Additional photo URLs
 * @property {boolean} available - Current availability flag
 * @property {ComponentSpecification[]} [specs] - Technical spec list
 * @property {HandoverMethod} handoverMethod - Handover verification method
 * @property {string} createdAt - ISO Timestamp
 * @property {string} [updatedAt] - ISO Timestamp
 */

/**
 * @typedef {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'} UrgencyLevel
 * @typedef {'open' | 'matched' | 'fulfilled' | 'cancelled'} RequestStatus
 */

/**
 * @typedef {Object} Request
 * @property {string} id - Unique request ID
 * @property {string} requesterId - Student User ID
 * @property {Object} requester - Requester snapshot
 * @property {string} requester.name - Requester name
 * @property {string} requester.year - Academic year & dept
 * @property {string} requester.avatar - Avatar URL
 * @property {string} title - What component/gear is requested
 * @property {string} description - Reason/context for request
 * @property {string} category - Component category
 * @property {UrgencyLevel} urgency - Urgency level
 * @property {number} [maxBudget] - Max budget in INR (if willing to rent/buy)
 * @property {string} neededByDate - Date or timeline needed by
 * @property {string} campusLocation - Preferred pickup lab/hostel location
 * @property {RequestStatus} status - 'open' | 'matched' | 'fulfilled' | 'cancelled'
 * @property {string} [fulfilledByListingId] - Matched listing ID
 * @property {string} createdAt - ISO Timestamp
 * @property {string} [updatedAt] - ISO Timestamp
 */

/**
 * @typedef {'pending_payment' | 'handover_pending' | 'active' | 'return_pending' | 'completed' | 'disputed' | 'cancelled'} RentalStatus
 * @typedef {'held' | 'released' | 'refunded' | 'forfeited'} EscrowStatus
 */

/**
 * @typedef {Object} RentalTimelineStep
 * @property {number} id - Step sequence index
 * @property {string} title - Step label
 * @property {string} time - Execution timestamp or status note
 * @property {'completed' | 'active' | 'pending'} status - Status indicator
 */

/**
 * @typedef {Object} Rental
 * @property {string} id - Unique rental transaction ID
 * @property {string} itemId - Reference to Listing ID
 * @property {string} itemTitle - Listing title snapshot
 * @property {string} itemImage - Listing image snapshot
 * @property {string} lenderId - User ID of component lender
 * @property {string} ownerName - Lender name snapshot
 * @property {string} ownerYear - Lender year snapshot
 * @property {string} ownerDept - Lender department snapshot
 * @property {string} ownerAvatar - Lender avatar URL
 * @property {string} borrowerId - User ID of student renting
 * @property {number} dailyRate - Daily rental rate in INR
 * @property {number} deposit - Escrow deposit held in INR
 * @property {number} [totalAmount] - Total transaction value
 * @property {string} startDate - Rental start date string
 * @property {string} dueDate - Due date string
 * @property {number} daysRemaining - Days left before return
 * @property {number} progressPercent - Rental timeline progress percentage (0-100)
 * @property {string} statusText - Status summary header (e.g. 'RETURN IN 4 DAYS')
 * @property {string} statusBadge - Status badge ('Active' | 'Urgent Return' | 'Completed')
 * @property {RentalStatus} status - Comprehensive relational status
 * @property {boolean} escrowProtected - Escrow security flag
 * @property {EscrowStatus} escrowStatus - Current deposit status
 * @property {string} qrCode - Secure QR verification string
 * @property {RentalTimelineStep[]} timeline - Transaction timeline step history
 * @property {string} createdAt - ISO Timestamp
 * @property {string} [updatedAt] - ISO Timestamp
 */

/**
 * @typedef {'rental_payment' | 'deposit_hold' | 'deposit_refund' | 'item_purchase' | 'bounty_payout'} TransactionType
 * @typedef {'pending' | 'escrow_held' | 'completed' | 'refunded' | 'failed'} TransactionStatus
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id - Transaction record identifier
 * @property {string} [rentalId] - Associated Rental ID
 * @property {string} [listingId] - Associated Listing ID
 * @property {string} payerId - Payer User ID
 * @property {string} recipientId - Recipient User ID
 * @property {number} amount - Transaction amount in INR
 * @property {number} depositAmount - Escrow deposit portion in INR
 * @property {TransactionType} type - Transaction classification
 * @property {TransactionStatus} status - Processing status
 * @property {string} paymentMethod - Escrow Wallet / UPI Mock
 * @property {string} referenceCode - Unique cryptographic reference code
 * @property {string} createdAt - ISO Timestamp
 */

/**
 * @typedef {Object} Rating
 * @property {string} id - Rating identifier
 * @property {string} transactionId - Reference to transaction or rental
 * @property {string} reviewerId - User ID of reviewer
 * @property {string} reviewerName - Snapshot of reviewer name
 * @property {string} revieweeId - User ID of student being reviewed
 * @property {number} rating - Star rating (1 to 5)
 * @property {string} comment - Text review comment
 * @property {string[]} [tags] - Praise tags (e.g. 'Punctual', 'Mint Condition')
 * @property {'as_lender' | 'as_borrower' | 'as_buyer' | 'as_seller'} role - Interaction role
 * @property {string} createdAt - ISO Timestamp
 */

/**
 * @typedef {'rental_update' | 'sos_alert' | 'listing_inquiry' | 'availability_alert' | 'smart_match' | 'system'} NotificationType
 * @typedef {'normal' | 'high' | 'urgent'} NotificationPriority
 */

/**
 * @typedef {Object} Notification
 * @property {string} id - Notification identifier
 * @property {string} userId - Recipient User ID
 * @property {NotificationType} type - Notification category
 * @property {string} title - Notification header
 * @property {string} message - Notification body description
 * @property {string} [linkUrl] - Navigation destination route
 * @property {boolean} isRead - Read / unread status
 * @property {NotificationPriority} priority - Urgency level
 * @property {string} createdAt - ISO Timestamp
 */

/**
 * @typedef {'ACTIVE' | 'MATCH_FOUND' | 'RESOURCE_OFFERED' | 'ACCEPTED' | 'HANDOVER_PENDING' | 'COMPLETED' | 'CANCELLED'} SOSStatus
 * @typedef {'URGENT' | 'HIGH' | 'NORMAL'} SOSUrgency
 */

/**
 * @typedef {Object} SOSRequest
 * @property {string} id - SOS alert identifier
 * @property {string} requesterId - Requester user identifier
 * @property {string} componentName - Hardware item needed urgently
 * @property {number} quantity - Number of units needed
 * @property {string} projectContext - Project / exam / viva context
 * @property {SOSUrgency} urgency - Urgency level (URGENT, HIGH, NORMAL)
 * @property {string} requiredBy - Deadline time or timeframe
 * @property {string} preferredLocation - Campus building or lab
 * @property {number} [budget] - Optional offer budget in INR
 * @property {string} [additionalSpecs] - Technical specifications or pinout notes
 * @property {SOSStatus} status - Current lifecycle status
 * @property {Object} requester - Requester snapshot
 * @property {string} requester.name - Requester name
 * @property {string} requester.dept - Requester department
 * @property {string} requester.year - Requester academic year
 * @property {string} requester.avatar - Requester avatar URL
 * @property {number} requester.rating - Requester trust rating
 * @property {Object} [offeredResource] - Resource offered by a peer
 * @property {string} createdAt - ISO Timestamp
 */

/**
 * @typedef {'PENDING' | 'QR_GENERATED' | 'VERIFIED' | 'COMPLETED'} HandoverStatus
 * @typedef {'RENTAL' | 'SALE' | 'BORROW' | 'SOS'} TransactionType
 */

/**
 * @typedef {Object} HandoverSession
 * @property {string} id - Handover session identifier
 * @property {string} transactionId - Associated transaction or SOS id
 * @property {string} itemTitle - Hardware item title
 * @property {number} quantity - Quantity of items
 * @property {string} ownerId - Lender/Owner user id
 * @property {string} ownerName - Lender/Owner name
 * @property {string} borrowerId - Borrower/Requester user id
 * @property {string} borrowerName - Borrower/Requester name
 * @property {string} qrCodeToken - Simulated QR verification token
 * @property {HandoverStatus} status - Handover status
 * @property {string} location - Meeting location
 * @property {string} createdAt - ISO Timestamp
 * @property {string} [completedAt] - Completion ISO Timestamp
 */

/**
 * @typedef {Object} TransactionRecord
 * @property {string} id - Unique transaction identifier
 * @property {string} title - Item title
 * @property {TransactionType} type - RENTAL, SALE, BORROW, SOS
 * @property {number} amount - Total amount in INR (0 for Borrow/free SOS)
 * @property {string} otherPartyName - Other student's name
 * @property {string} otherPartyRole - 'Lender' | 'Borrower' | 'Seller' | 'Buyer'
 * @property {string} date - Transaction date string
 * @property {'Active' | 'Handover Pending' | 'Completed' | 'Returned'} status - Transaction lifecycle state
 * @property {string} handoverStatus - Handover verification state
 * @property {number} [rating] - Star rating given (1-5)
 * @property {string} [image] - Item thumbnail
 */

/**
 * @typedef {'Embedded Systems' | 'Robotics' | 'AI/ML' | 'IoT' | 'VLSI' | 'Power Electronics' | 'Mechatronics'} ProjectDomain
 */

/**
 * @typedef {Object} Project
 * @property {string} id - Project identifier
 * @property {string} ownerId - Student creator ID
 * @property {string} title - Project title
 * @property {string} description - Abstract and project scope
 * @property {ProjectDomain} domain - Technical engineering discipline
 * @property {string[]} requiredComponents - List of hardware components required
 * @property {string[]} techStack - Software/hardware stack (e.g., ['C++', 'FreeRTOS', 'ESP32'])
 * @property {string} [projectKitId] - Associated project kit reference
 * @property {'planning' | 'in_progress' | 'completed'} status - Project lifecycle state
 * @property {string[]} teamMembers - Array of user names/IDs
 * @property {string} [repoUrl] - Git repository URL
 * @property {string} [documentationUrl] - Project docs / schematic URL
 * @property {string} createdAt - ISO Timestamp
 */

/**
 * @typedef {Object} ProjectKitComponent
 * @property {string} name - Part name
 * @property {number} quantity - Quantity in kit
 * @property {number} estimatedCost - Estimated INR cost
 * @property {boolean} inStockOnCampus - Campus availability flag
 */

/**
 * @typedef {Object} ProjectKit
 * @property {string} id - Project Kit identifier
 * @property {string} title - Kit bundle title (e.g., 'IoT Smart Weather Station Kit')
 * @property {string} description - Kit overview and project applications
 * @property {string} category - Discipline category
 * @property {'Beginner' | 'Intermediate' | 'Advanced'} targetLevel - Difficulty level
 * @property {number} estimatedBudget - Total estimated BOM cost in INR
 * @property {ProjectKitComponent[]} componentsList - Curated bill of materials
 * @property {string} [guideUrl] - Step-by-step tutorial link
 * @property {string} [schematicUrl] - Wiring schematic reference
 * @property {string[]} tags - Engineering tags
 * @property {boolean} isOfficialLabKit - Certified by campus faculty
 * @property {string} image - Kit preview image
 * @property {string} createdAt - ISO Timestamp
 */

/**
 * @typedef {Object} ProjectPartner
 * @property {string} id - Collaboration listing identifier
 * @property {string} creatorId - Creator user ID
 * @property {string} creatorName - Creator student name
 * @property {string} creatorDept - Creator department & year
 * @property {string} creatorAvatar - Creator avatar URL
 * @property {string} projectTitle - Project or hackathon title
 * @property {string} projectDescription - Project details and mission
 * @property {string[]} requiredSkills - Desired engineering skills
 * @property {string} targetCompetition - E.g. 'Smart India Hackathon', 'Formula Student', 'Capstone'
 * @property {number} teamSize - Current team size
 * @property {number} openPositions - Open roles count
 * @property {'Open' | 'Closed'} status - Recruitment status
 * @property {string} createdAt - ISO Timestamp
 */

/**
 * @typedef {'datasheet' | 'pinout' | 'tutorial' | 'troubleshooting' | 'lab_manual'} KnowledgeType
 */

/**
 * @typedef {Object} KnowledgeResource
 * @property {string} id - Knowledge entry identifier
 * @property {string} title - Resource title (e.g., 'ESP32 Complete Pinout & GPIO Reference')
 * @property {KnowledgeType} type - Resource category
 * @property {string} category - Component classification
 * @property {string} [componentId] - Associated component ID
 * @property {string} componentName - Component part name
 * @property {string} [fileUrl] - PDF/Image download link
 * @property {string} [externalLink] - External documentation link
 * @property {string} summary - Concise summary or key takeaway
 * @property {string[]} tags - Lookup tags
 * @property {string} authorName - Contributor name
 * @property {number} upvotes - Student community upvotes
 * @property {boolean} verifiedByFaculty - Faculty verification badge
 * @property {string} createdAt - ISO Timestamp
 */

/**
 * @typedef {Object} Donation
 * @property {string} id - Donation identifier
 * @property {string} donorId - Donor student User ID
 * @property {string} donorName - Donor student name
 * @property {string} donorAvatar - Donor avatar URL
 * @property {string} componentTitle - Component/kit donated
 * @property {string} category - Hardware category
 * @property {string} condition - Item condition
 * @property {number} quantity - Quantity of units
 * @property {string} dropOffLocation - Lab or department donation bin
 * @property {'available' | 'claimed' | 'delivered'} status - Donation status
 * @property {string} [claimedBy] - Student or lab who claimed the donation
 * @property {number} co2SavedKg - Estimated CO₂ footprint reduction (kg)
 * @property {number} eWastePreventedGrams - Estimated e-waste prevented (g)
 * @property {string} createdAt - ISO Timestamp
 */

/**
 * Factory helpers for creating validated domain instances
 */
export const Models = {
  /**
   * Helper to construct a standard Listing
   * @param {Partial<Listing>} data 
   * @returns {Listing}
   */
  createListing(data) {
    return {
      id: data.id || `item-${Date.now()}`,
      ownerId: data.ownerId || 'user-001',
      owner: data.owner || {
        name: 'Arjun Sharma',
        year: '3rd Year',
        dept: 'Robotics & Automation',
        rating: 4.9,
        swapsCount: 18,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        verified: true
      },
      componentId: data.componentId || null,
      title: data.title || '',
      description: data.description || '',
      category: data.category || 'Microcontrollers',
      type: data.type || 'Rent',
      price: Number(data.price) || 0,
      priceUnit: data.priceUnit || (data.type === 'Rent' ? '/day' : data.type === 'Buy' ? 'One-time' : 'Free Peer Borrow'),
      deposit: Number(data.deposit) || 0,
      condition: data.condition || 'Lab Tested',
      location: data.location || 'Main Campus',
      campusLocationId: data.campusLocationId || null,
      image: data.image || 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80',
      galleryImages: data.galleryImages || [],
      available: data.available !== false,
      specs: data.specs || [],
      handoverMethod: data.handoverMethod || 'qr_handover',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  /**
   * Helper to construct an SOS Request
   * @param {Partial<SOSRequest>} data 
   * @returns {SOSRequest}
   */
  createSOSRequest(data) {
    return {
      id: data.id || `sos-${Date.now()}`,
      title: data.title || '',
      lab: data.lab || 'Main Lab',
      urgency: data.urgency || 'HIGH • Within 1 hour',
      neededFor: data.neededFor || 'Laboratory evaluation',
      requester: data.requester || 'Student',
      year: data.year || '3rd Year Engineering',
      bounty: data.bounty || '₹50 + Free Coffee ☕',
      timeAgo: data.timeAgo || 'Just now',
      status: data.status || 'Open',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      responderId: data.responderId || null,
      createdAt: data.createdAt || new Date().toISOString()
    };
  },

  /**
   * Helper to construct a Campus Resource
   * @param {Partial<CampusResource>} data
   * @returns {CampusResource}
   */
  createCampusResource(data) {
    return {
      id: data.id || `res-${Date.now()}`,
      name: data.name || 'Campus Hardware',
      category: data.category || 'Lab Equipment',
      availability: data.availability || 'AVAILABLE',
      availabilityLabel:
        data.availability === 'AVAILABLE'
          ? 'Available now'
          : data.availability === 'LIMITED'
          ? 'Limited availability'
          : data.availability === 'UNAVAILABLE'
          ? 'Currently unavailable'
          : 'Availability not recently updated',
      provider: data.provider || 'Department of Electronics',
      building: data.building || 'Engineering Block',
      room: data.room || 'General Lab',
      campusZone: data.campusZone || 'Academic Zone',
      locationId: data.locationId || 'loc-eng-block',
      distanceMeters: data.distanceMeters || 100,
      distanceText: data.distanceText || `${data.distanceMeters || 100}m away`,
      type: data.type || 'Borrow',
      price: Number(data.price) || 0,
      rating: Number(data.rating) || 4.8,
      isVerified: data.isVerified !== false,
      condition: data.condition || 'Lab Tested',
      description: data.description || 'Hardware equipment available for academic and project access.',
      image: data.image || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
      specs: data.specs || [],
      totalStock: Number(data.totalStock) || 1,
      availableStock: Number(data.availableStock) || 1,
      linkedListingId: data.linkedListingId || null,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};
