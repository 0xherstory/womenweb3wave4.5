// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ARoomEnhanced is 
    Ownable(address(this)), 
    ReentrancyGuard, 
    Pausable
{

    // ============ STRUCTS ============
    
    struct GuestInfo {
        string nickname;
        string contactMethod;
        string introductionMessage;
    }

    // ============ STATE VARIABLES ============
    
    uint256 private _bookingIds;
    
    // Simplified data storage using individual mappings instead of structs
    mapping(uint256 => address) public bookingGuest; // bookingId => guest address
    mapping(uint256 => uint256) public bookingCheckInDate; // bookingId => check-in date
    mapping(uint256 => uint256) public bookingCheckOutDate; // bookingId => check-out date
    mapping(uint256 => uint256) public bookingTotalAmount; // bookingId => total amount
    mapping(uint256 => uint256) public bookingDepositAmount; // bookingId => deposit amount
    mapping(uint256 => bool) public bookingIsPaid; // bookingId => is paid
    mapping(uint256 => bool) public bookingIsApproved; // bookingId => is approved
    mapping(uint256 => bool) public bookingIsCheckedIn; // bookingId => is checked in
    mapping(uint256 => bool) public bookingIsCancelled; // bookingId => is cancelled
    mapping(uint256 => string) public bookingOwnerApprovalMessage; // bookingId => approval message
    mapping(uint256 => string) public bookingEntryPassword; // bookingId => entry password
    mapping(uint256 => bool) public bookingPasswordRevealed; // bookingId => password revealed
    mapping(uint256 => uint256) public bookingCreatedAt; // bookingId => created timestamp
    mapping(uint256 => uint256) public bookingApprovalTimestamp; // bookingId => approval timestamp
    mapping(uint256 => uint256) public bookingPasswordGeneratedTimestamp; // bookingId => password generated timestamp
    
    // Guest info storage
    mapping(uint256 => string) public bookingGuestNickname; // bookingId => guest nickname
    mapping(uint256 => string) public bookingGuestContact; // bookingId => guest contact method
    mapping(uint256 => string) public bookingGuestIntro; // bookingId => guest introduction
    
    mapping(address => uint256[]) public guestBookings;
    mapping(bytes32 => bool) public usedSignatures;
    mapping(bytes32 => bool) public usedPasswords;
    
    // Booking availability tracking - optimized to prevent stack overflow
    mapping(uint256 => bool) public dateBlocked; // date => blocked status
    mapping(uint256 => mapping(uint256 => bool)) private bookingDateMap; // date => bookingId => exists
    
    uint256 public baseRoomPrice;
    uint256 public depositPercentage;
    uint256 public cancellationRefundPercentage;
    uint256 public minAdvanceBookingDays;
    uint256 public maxAdvanceBookingDays;
    uint256 public maxStayDays;
    
    IERC20 public paymentToken;
    address public signerAddress;
    
    // ============ EVENTS ============
    
    event BookingCreated(
        uint256 indexed bookingId,
        address indexed guest,
        uint256 checkInDate,
        uint256 checkOutDate,
        uint256 totalAmount,
        uint256 depositAmount,
        string guestNickname,
        string guestContactMethod
    );
    
    event BookingApproved(
        uint256 indexed bookingId,
        address indexed guest,
        string ownerApprovalMessage,
        uint256 approvalTimestamp
    );
    
    event DatesBlocked(
        uint256 indexed bookingId,
        uint256 checkInDate,
        uint256 checkOutDate,
        uint256 timestamp
    );
    
    event EntryPasswordGenerated(
        uint256 indexed bookingId,
        address indexed guest,
        string entryPassword,
        uint256 timestamp
    );
    
    event PasswordRevealedToGuest(
        uint256 indexed bookingId,
        address indexed guest,
        string entryPassword,
        uint256 timestamp
    );
    
    event DepositPaid(
        uint256 indexed bookingId,
        address indexed guest,
        uint256 amount
    );
    
    event CheckInCompleted(
        uint256 indexed bookingId,
        address indexed guest,
        string entryPassword,
        uint256 timestamp
    );
    
    event BookingCancelled(
        uint256 indexed bookingId,
        address indexed guest,
        uint256 refundAmount,
        string reason
    );
    
    event WithdrawalCompleted(
        uint256 indexed bookingId,
        address indexed guest,
        uint256 amount
    );

    event PhysicalCheckInConfirmed(
        uint256 indexed bookingId,
        address indexed guest,
        uint256 timestamp
    );

    // ============ MODIFIERS ============
    
    modifier onlyGuest(uint256 bookingId) {
        require(bookingGuest[bookingId] == msg.sender, "ARoom: Not the guest");
        _;
    }
    
    modifier bookingExists(uint256 bookingId) {
        require(bookingGuest[bookingId] != address(0), "ARoom: Booking does not exist");
        _;
    }
    
    modifier notCancelled(uint256 bookingId) {
        require(!bookingIsCancelled[bookingId], "ARoom: Booking is cancelled");
        _;
    }
    
    modifier bookingApproved(uint256 bookingId) {
        require(bookingIsApproved[bookingId], "ARoom: Booking not approved by owner");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(
        address _paymentToken,
        address _signerAddress,
        uint256 _baseRoomPrice,
        uint256 _depositPercentage,
        uint256 _cancellationRefundPercentage
    ) {
        paymentToken = IERC20(_paymentToken);
        signerAddress = _signerAddress;
        baseRoomPrice = _baseRoomPrice;
        depositPercentage = _depositPercentage;
        cancellationRefundPercentage = _cancellationRefundPercentage;
        minAdvanceBookingDays = 1;
        maxAdvanceBookingDays = 365;
        maxStayDays = 7; // Maximum 7 days stay
    }


    
    // ============ SIGNATURE UTILITIES ============
    
    function recoverSigner(bytes32 hash, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "ARoom: Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        if (v < 27) v += 27;
        require(v == 27 || v == 28, "ARoom: Invalid signature 'v' value");
        
        return ecrecover(hash, v, r, s);
    }

    // ============ ADMIN FUNCTIONS ============
    
    function setBaseRoomPrice(uint256 _baseRoomPrice) external onlyOwner {
        baseRoomPrice = _baseRoomPrice;
    }
    
    function setDepositPercentage(uint256 _depositPercentage) external onlyOwner {
        require(_depositPercentage <= 100, "ARoom: Invalid percentage");
        depositPercentage = _depositPercentage;
    }
    
    function setCancellationRefundPercentage(uint256 _percentage) external onlyOwner {
        require(_percentage <= 100, "ARoom: Invalid percentage");
        cancellationRefundPercentage = _percentage;
    }
    
    function setSignerAddress(address _signerAddress) external onlyOwner {
        signerAddress = _signerAddress;
    }
    
    function setBookingTimeframe(uint256 _minDays, uint256 _maxDays) external onlyOwner {
        require(_minDays < _maxDays, "ARoom: Invalid timeframe");
        minAdvanceBookingDays = _minDays;
        maxAdvanceBookingDays = _maxDays;
    }
    
    function setMaxStayDays(uint256 _maxStayDays) external onlyOwner {
        require(_maxStayDays > 0 && _maxStayDays <= 30, "ARoom: Invalid max stay days");
        maxStayDays = _maxStayDays;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ BOOKING FUNCTIONS ============
    
    function createBooking(
        uint256 checkInDate,
        uint256 checkOutDate,
        string memory nickname,
        string memory contactMethod,
        string memory introductionMessage
    ) external whenNotPaused nonReentrant {
        _createBookingInternal(checkInDate, checkOutDate, nickname, contactMethod, introductionMessage);
    }
    
    function _createBookingInternal(
        uint256 checkInDate,
        uint256 checkOutDate,
        string memory nickname,
        string memory contactMethod,
        string memory introductionMessage
    ) internal {
        // Validate inputs
        _validateBookingDates(checkInDate, checkOutDate);
        _validateGuestInfo(nickname, contactMethod, introductionMessage);
        
        // Check maximum stay duration
        uint256 stayDuration = (checkOutDate - checkInDate) / 1 days;
        require(stayDuration <= maxStayDays, "ARoom: Stay exceeds maximum allowed days");
        
        // Check if dates are already blocked by approved bookings
        require(!areDatesBlocked(checkInDate, checkOutDate), "ARoom: Dates already blocked by approved booking");
        
        // Calculate amounts
        uint256 totalDays = (checkOutDate - checkInDate) / 1 days;
        uint256 totalAmount = baseRoomPrice * totalDays;
        uint256 depositAmount = (totalAmount * depositPercentage) / 100;
        
        // Create booking
        _bookingIds++;
        uint256 bookingId = _bookingIds;
        
        // Create booking
        _createBookingStruct(bookingId, checkInDate, checkOutDate, totalAmount, depositAmount, nickname, contactMethod, introductionMessage);
        
        // Add to guest bookings
        guestBookings[msg.sender].push(bookingId);
        
        // Add booking to date tracking
        addBookingToDates(bookingId, checkInDate, checkOutDate);
        
        // Emit event
        emit BookingCreated(
            bookingId,
            msg.sender,
            checkInDate,
            checkOutDate,
            totalAmount,
            depositAmount,
            nickname,
            contactMethod
        );
    }
    
    function _validateBookingDates(uint256 checkInDate, uint256 checkOutDate) internal view {
        require(checkInDate > block.timestamp + (minAdvanceBookingDays * 1 days), "ARoom: Too early for check-in");
        require(checkInDate < block.timestamp + (maxAdvanceBookingDays * 1 days), "ARoom: Too late for check-in");
        require(checkOutDate > checkInDate, "ARoom: Invalid check-out date");
    }
    
    function _validateGuestInfo(
        string memory nickname,
        string memory contactMethod,
        string memory introductionMessage
    ) internal pure {
        require(bytes(nickname).length > 0, "ARoom: What should I call you?");
        require(bytes(contactMethod).length > 0, "ARoom: WeChat/Tg/Phone, let's get familiar");
        require(bytes(introductionMessage).length > 0, "ARoom: Say hi, and something about your trip");
    }
    

    
    function _createBookingStruct(
        uint256 bookingId,
        uint256 checkInDate,
        uint256 checkOutDate,
        uint256 totalAmount,
        uint256 depositAmount,
        string memory nickname,
        string memory contactMethod,
        string memory introductionMessage
    ) internal {
        bookingGuest[bookingId] = msg.sender;
        bookingCheckInDate[bookingId] = checkInDate;
        bookingCheckOutDate[bookingId] = checkOutDate;
        bookingTotalAmount[bookingId] = totalAmount;
        bookingDepositAmount[bookingId] = depositAmount;
        bookingIsPaid[bookingId] = false;
        bookingIsApproved[bookingId] = false;
        bookingIsCheckedIn[bookingId] = false;
        bookingIsCancelled[bookingId] = false;
        bookingOwnerApprovalMessage[bookingId] = "";
        bookingEntryPassword[bookingId] = "";
        bookingPasswordRevealed[bookingId] = false;
        bookingCreatedAt[bookingId] = block.timestamp;
        bookingApprovalTimestamp[bookingId] = 0;
        bookingPasswordGeneratedTimestamp[bookingId] = 0;
        
        // Store guest info
        bookingGuestNickname[bookingId] = nickname;
        bookingGuestContact[bookingId] = contactMethod;
        bookingGuestIntro[bookingId] = introductionMessage;
    }

    // ============ OWNER APPROVAL FUNCTIONS ============
    
    function approveBooking(
        uint256 bookingId,
        string memory ownerApprovalMessage,
        bytes memory signature
    ) external 
        bookingExists(bookingId) 
        notCancelled(bookingId) 
        whenNotPaused 
        nonReentrant 
    {
        require(!bookingIsApproved[bookingId], "ARoom: Booking already approved");
        require(!bookingIsCancelled[bookingId], "ARoom: Cannot approve cancelled booking");
        require(bytes(ownerApprovalMessage).length > 0, "ARoom: Approval message required");
        
        address guest = bookingGuest[bookingId];
        uint256 checkInDate = bookingCheckInDate[bookingId];
        uint256 checkOutDate = bookingCheckOutDate[bookingId];
        
        // Verify signature from owner
        bytes32 messageHash = keccak256(abi.encodePacked(
            bookingId,
            guest,
            ownerApprovalMessage,
            block.chainid
        ));
        
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);
        
        require(recoveredSigner == signerAddress, "ARoom: Invalid owner signature");
        
        // Check for signature reuse
        bytes32 signatureHash = keccak256(signature);
        require(!usedSignatures[signatureHash], "ARoom: Signature already used");
        usedSignatures[signatureHash] = true;
        
        // Check if dates are still available (no other approved bookings)
        require(!areDatesBlocked(checkInDate, checkOutDate), "ARoom: Dates already blocked by another approved booking");
        
        // Approve booking
        bookingIsApproved[bookingId] = true;
        bookingOwnerApprovalMessage[bookingId] = ownerApprovalMessage;
        bookingApprovalTimestamp[bookingId] = block.timestamp;
        
        // Block the dates for this booking
        blockDates(checkInDate, checkOutDate);
        
        emit BookingApproved(bookingId, guest, ownerApprovalMessage, block.timestamp);
        emit DatesBlocked(bookingId, checkInDate, checkOutDate, block.timestamp);
    }
    
    function generateEntryPassword(
        uint256 bookingId,
        bytes memory signature
    ) external 
        bookingExists(bookingId) 
        bookingApproved(bookingId) 
        notCancelled(bookingId) 
        whenNotPaused 
        nonReentrant 
    {
        require(!bookingIsCheckedIn[bookingId], "ARoom: Already checked in");
        require(block.timestamp >= bookingCheckInDate[bookingId], "ARoom: Too early for check-in");
        require(block.timestamp <= bookingCheckOutDate[bookingId], "ARoom: Check-in period expired");
        require(bookingIsPaid[bookingId], "ARoom: Deposit must be paid first");
        require(bytes(bookingEntryPassword[bookingId]).length == 0, "ARoom: Password already generated");
        
        address guest = bookingGuest[bookingId];
        
        // Verify signature from owner
        bytes32 messageHash = keccak256(abi.encodePacked(
            bookingId,
            guest,
            "GENERATE_PASSWORD",
            block.chainid
        ));
        
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);
        
        require(recoveredSigner == signerAddress, "ARoom: Invalid owner signature");
        
        // Generate unique password
        string memory entryPassword = generateUniquePassword(bookingId, guest);
        
        // Store password
        bookingEntryPassword[bookingId] = entryPassword;
        bookingPasswordGeneratedTimestamp[bookingId] = block.timestamp;
        
        // Mark password as used
        bytes32 passwordHash = keccak256(abi.encodePacked(entryPassword));
        usedPasswords[passwordHash] = true;
        
        emit EntryPasswordGenerated(bookingId, guest, entryPassword, block.timestamp);
    }
    
    function generateUniquePassword(uint256 bookingId, address guest) internal view returns (string memory) {
        // Generate a unique 8-character password based on booking details
        bytes32 hash = keccak256(abi.encodePacked(
            bookingId,
            guest,
            block.timestamp,
            block.prevrandao
        ));
        
        bytes memory chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        bytes memory password = new bytes(8);
        
        for (uint256 i = 0; i < 8; i++) {
            password[i] = chars[uint8(hash[i]) % chars.length];
        }
        
        return string(password);
    }
    
    function payDeposit(uint256 bookingId) external 
        bookingExists(bookingId) 
        onlyGuest(bookingId) 
        notCancelled(bookingId) 
        bookingApproved(bookingId)
        whenNotPaused 
        nonReentrant 
    {
        require(!bookingIsPaid[bookingId], "ARoom: Deposit already paid");
        
        uint256 depositAmount = bookingDepositAmount[bookingId];
        require(
            paymentToken.transferFrom(msg.sender, address(this), depositAmount),
            "ARoom: Transfer failed"
        );
        
        bookingIsPaid[bookingId] = true;
        
        emit DepositPaid(bookingId, msg.sender, depositAmount);
    }

    // ============ PASSWORD REVEAL AND CHECK-IN ============
    
    function confirmPhysicalCheckIn(
        uint256 bookingId,
        bytes memory signature
    ) external 
        bookingExists(bookingId) 
        notCancelled(bookingId) 
        bookingApproved(bookingId)
        whenNotPaused 
        nonReentrant 
    {
        require(bookingIsPaid[bookingId], "ARoom: Deposit not paid");
        require(!bookingIsCheckedIn[bookingId], "ARoom: Already checked in");
        require(block.timestamp >= bookingCheckInDate[bookingId], "ARoom: Too early for check-in");
        require(block.timestamp <= bookingCheckOutDate[bookingId], "ARoom: Check-in period expired");
        require(bytes(bookingEntryPassword[bookingId]).length > 0, "ARoom: Entry password not generated");
        
        address guest = bookingGuest[bookingId];
        
        // Verify signature from owner
        bytes32 messageHash = keccak256(abi.encodePacked(
            bookingId,
            guest,
            "CONFIRM_PHYSICAL_CHECKIN",
            block.chainid
        ));
        
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);
        
        require(recoveredSigner == signerAddress, "ARoom: Invalid owner signature");
        
        // Check for signature reuse
        bytes32 signatureHash = keccak256(signature);
        require(!usedSignatures[signatureHash], "ARoom: Signature already used");
        usedSignatures[signatureHash] = true;
        
        // Mark as checked in
        bookingIsCheckedIn[bookingId] = true;
        
        emit PhysicalCheckInConfirmed(bookingId, guest, block.timestamp);
    }
    
    function revealPasswordToGuest(
        uint256 bookingId,
        bytes memory signature
    ) external 
        bookingExists(bookingId) 
        notCancelled(bookingId) 
        bookingApproved(bookingId)
        whenNotPaused 
        nonReentrant 
    {
        require(bookingIsPaid[bookingId], "ARoom: Deposit not paid");
        require(bookingIsCheckedIn[bookingId], "ARoom: Physical check-in not confirmed");
        require(bytes(bookingEntryPassword[bookingId]).length > 0, "ARoom: Entry password not generated");
        require(!bookingPasswordRevealed[bookingId], "ARoom: Password already revealed");
        require(block.timestamp >= bookingCheckInDate[bookingId], "ARoom: Cannot reveal password before check-in date");
        require(block.timestamp <= bookingCheckOutDate[bookingId], "ARoom: Check-in period expired");
        
        address guest = bookingGuest[bookingId];
        string memory entryPassword = bookingEntryPassword[bookingId];
        
        // Verify signature from owner
        bytes32 messageHash = keccak256(abi.encodePacked(
            bookingId,
            guest,
            "REVEAL_PASSWORD",
            block.chainid
        ));
        
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);
        
        require(recoveredSigner == signerAddress, "ARoom: Invalid owner signature");
        
        // Check for signature reuse
        bytes32 signatureHash = keccak256(signature);
        require(!usedSignatures[signatureHash], "ARoom: Signature already used");
        usedSignatures[signatureHash] = true;
        
        // Reveal password to guest
        bookingPasswordRevealed[bookingId] = true;
        
        emit PasswordRevealedToGuest(bookingId, guest, entryPassword, block.timestamp);
    }
    
    function checkIn(
        uint256 bookingId,
        string memory entryPassword
    ) external 
        bookingExists(bookingId) 
        onlyGuest(bookingId) 
        notCancelled(bookingId) 
        bookingApproved(bookingId)
        whenNotPaused 
        nonReentrant 
    {
        require(bookingIsPaid[bookingId], "ARoom: Deposit not paid");
        require(bookingIsCheckedIn[bookingId], "ARoom: Physical check-in not confirmed");
        require(block.timestamp >= bookingCheckInDate[bookingId], "ARoom: Too early for check-in");
        require(block.timestamp <= bookingCheckOutDate[bookingId], "ARoom: Check-in period expired");
        require(bytes(bookingEntryPassword[bookingId]).length > 0, "ARoom: Entry password not generated");
        require(bookingPasswordRevealed[bookingId], "ARoom: Password not yet revealed by owner");
        
        // Verify entry password
        require(
            keccak256(abi.encodePacked(entryPassword)) == keccak256(abi.encodePacked(bookingEntryPassword[bookingId])),
            "ARoom: Invalid entry password"
        );
        
        // Check for password reuse
        bytes32 passwordHash = keccak256(abi.encodePacked(entryPassword));
        require(!usedPasswords[passwordHash], "ARoom: Password already used");
        usedPasswords[passwordHash] = true;
        
        emit CheckInCompleted(bookingId, msg.sender, entryPassword, block.timestamp);
    }

    // ============ CANCELLATION AND WITHDRAWAL ============
    
    function cancelBooking(uint256 bookingId, string memory reason) external 
        bookingExists(bookingId) 
        onlyGuest(bookingId) 
        notCancelled(bookingId) 
        whenNotPaused 
        nonReentrant 
    {
        require(!bookingIsCheckedIn[bookingId], "ARoom: Cannot cancel after check-in");
        require(block.timestamp < bookingCheckInDate[bookingId], "ARoom: Cannot cancel after check-in date");
        
        bookingIsCancelled[bookingId] = true;
        
        // If booking was approved, unblock the dates
        if (bookingIsApproved[bookingId]) {
            unblockDates(bookingCheckInDate[bookingId], bookingCheckOutDate[bookingId]);
        }
        
        uint256 refundAmount = 0;
        if (bookingIsPaid[bookingId]) {
            refundAmount = (bookingDepositAmount[bookingId] * cancellationRefundPercentage) / 100;
            if (refundAmount > 0) {
                require(
                    paymentToken.transfer(msg.sender, refundAmount),
                    "ARoom: Refund transfer failed"
                );
            }
        }
        
        emit BookingCancelled(bookingId, msg.sender, refundAmount, reason);
    }
    
    function withdrawRemainingDeposit(uint256 bookingId) external 
        bookingExists(bookingId) 
        onlyGuest(bookingId) 
        notCancelled(bookingId) 
        whenNotPaused 
        nonReentrant 
    {
        require(bookingIsPaid[bookingId], "ARoom: No deposit to withdraw");
        require(bookingIsCheckedIn[bookingId], "ARoom: Must check in first");
        require(block.timestamp >= bookingCheckOutDate[bookingId], "ARoom: Cannot withdraw before check-out");
        
        uint256 remainingAmount = bookingDepositAmount[bookingId];
        bookingIsPaid[bookingId] = false; // Prevent double withdrawal
        
        require(
            paymentToken.transfer(msg.sender, remainingAmount),
            "ARoom: Withdrawal transfer failed"
        );
        
        emit WithdrawalCompleted(bookingId, msg.sender, remainingAmount);
    }

    // ============ VIEW FUNCTIONS ============
    
    function getGuestBookings(address guest) external view returns (uint256[] memory) {
        return guestBookings[guest];
    }
    
    function calculateBookingCost(
        uint256 checkInDate,
        uint256 checkOutDate
    ) external view returns (uint256 totalAmount, uint256 depositAmount) {
        uint256 totalDays = (checkOutDate - checkInDate) / 1 days;
        totalAmount = baseRoomPrice * totalDays;
        depositAmount = (totalAmount * depositPercentage) / 100;
        
        return (totalAmount, depositAmount);
    }
    
    function getContractBalance() external view returns (uint256) {
        return paymentToken.balanceOf(address(this));
    }
    
    function isSignatureUsed(bytes memory signature) external view returns (bool) {
        bytes32 signatureHash = keccak256(signature);
        return usedSignatures[signatureHash];
    }
    
    function isPasswordUsed(string memory password) external view returns (bool) {
        bytes32 passwordHash = keccak256(abi.encodePacked(password));
        return usedPasswords[passwordHash];
    }
    
    function canRevealPassword(uint256 bookingId) external view returns (bool) {
        return (
            bookingIsPaid[bookingId] &&
            bookingIsCheckedIn[bookingId] &&
            bytes(bookingEntryPassword[bookingId]).length > 0 &&
            !bookingPasswordRevealed[bookingId] &&
            block.timestamp >= bookingCheckInDate[bookingId] &&
            block.timestamp <= bookingCheckOutDate[bookingId]
        );
    }
    
    function areDatesAvailable(uint256 checkInDate, uint256 checkOutDate) external view returns (bool) {
        return !areDatesBlocked(checkInDate, checkOutDate);
    }
    
    // Efficient helper function to check if a booking exists for a specific date
    function isBookingOnDate(uint256 date, uint256 bookingId) external view returns (bool) {
        return bookingDateMap[date][bookingId];
    }

    // ============ EMERGENCY FUNCTIONS ============
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "ARoom: No balance to withdraw");
        
        require(
            paymentToken.transfer(owner(), balance),
            "ARoom: Emergency withdrawal failed"
        );
    }
    
    function updatePaymentToken(address _newPaymentToken) external onlyOwner {
        paymentToken = IERC20(_newPaymentToken);
    }

    // ============ BOOKING MODIFICATIONS ============
    
    function modifyBooking(
        uint256 bookingId,
        uint256 newCheckInDate,
        uint256 newCheckOutDate
    ) external 
        bookingExists(bookingId) 
        onlyGuest(bookingId) 
        notCancelled(bookingId) 
        whenNotPaused 
        nonReentrant 
    {
        _modifyBookingInternal(bookingId, newCheckInDate, newCheckOutDate);
    }
    
    function _modifyBookingInternal(
        uint256 bookingId,
        uint256 newCheckInDate,
        uint256 newCheckOutDate
    ) internal {
        require(!bookingIsCheckedIn[bookingId], "ARoom: Cannot modify after check-in");
        require(newCheckInDate > block.timestamp + (minAdvanceBookingDays * 1 days), "ARoom: Too early for new check-in");
        require(newCheckInDate < block.timestamp + (maxAdvanceBookingDays * 1 days), "ARoom: Too late for new check-in");
        require(newCheckOutDate > newCheckInDate, "ARoom: Invalid new check-out date");
        
        // Check maximum stay duration
        uint256 stayDuration = (newCheckOutDate - newCheckInDate) / 1 days;
        require(stayDuration <= maxStayDays, "ARoom: Stay exceeds maximum allowed days");
        
        // Store old dates
        uint256 oldCheckInDate = bookingCheckInDate[bookingId];
        uint256 oldCheckOutDate = bookingCheckOutDate[bookingId];
        
        // If booking was approved, unblock old dates
        if (bookingIsApproved[bookingId]) {
            unblockDates(oldCheckInDate, oldCheckOutDate);
        }
        
        // Check if new dates are available
        require(!areDatesBlocked(newCheckInDate, newCheckOutDate), "ARoom: New dates already blocked by approved booking");
        
        // Update date tracking
        removeBookingFromDates(bookingId, oldCheckInDate, oldCheckOutDate);
        addBookingToDates(bookingId, newCheckInDate, newCheckOutDate);
        
        // Update booking
        bookingCheckInDate[bookingId] = newCheckInDate;
        bookingCheckOutDate[bookingId] = newCheckOutDate;
        
        // Recalculate amounts
        uint256 totalDays = (newCheckOutDate - newCheckInDate) / 1 days;
        uint256 newTotalAmount = baseRoomPrice * totalDays;
        uint256 newDepositAmount = (newTotalAmount * depositPercentage) / 100;
        
        bookingTotalAmount[bookingId] = newTotalAmount;
        bookingDepositAmount[bookingId] = newDepositAmount;
        
        // Reset approval status
        bookingIsApproved[bookingId] = false;
        bookingOwnerApprovalMessage[bookingId] = "";
        bookingEntryPassword[bookingId] = "";
        bookingPasswordRevealed[bookingId] = false;
        bookingApprovalTimestamp[bookingId] = 0;
        bookingPasswordGeneratedTimestamp[bookingId] = 0;
        
        // Handle payment differences
        _handlePaymentDifference(bookingId, newDepositAmount);
    }
    
    function _handlePaymentDifference(uint256 bookingId, uint256 newDepositAmount) internal {
        if (!bookingIsPaid[bookingId]) return;
        
        uint256 oldDepositAmount = bookingDepositAmount[bookingId];
        
        if (newDepositAmount > oldDepositAmount) {
            uint256 additionalAmount = newDepositAmount - oldDepositAmount;
            require(
                paymentToken.transferFrom(msg.sender, address(this), additionalAmount),
                "ARoom: Additional payment failed"
            );
        } else if (newDepositAmount < oldDepositAmount) {
            uint256 refundAmount = oldDepositAmount - newDepositAmount;
            require(
                paymentToken.transfer(msg.sender, refundAmount),
                "ARoom: Refund failed"
            );
        }
    }

    // ============ PARTIAL CANCELLATIONS ============
    
    function cancelPartialBooking(
        uint256 bookingId,
        uint256 daysToCancel
    ) external 
        bookingExists(bookingId) 
        onlyGuest(bookingId) 
        notCancelled(bookingId) 
        whenNotPaused 
        nonReentrant 
    {
        _cancelPartialBookingInternal(bookingId, daysToCancel);
    }
    
    function _cancelPartialBookingInternal(uint256 bookingId, uint256 daysToCancel) internal {
        require(!bookingIsCheckedIn[bookingId], "ARoom: Cannot cancel after check-in");
        require(block.timestamp < bookingCheckInDate[bookingId], "ARoom: Cannot cancel after check-in date");
        require(daysToCancel > 0, "ARoom: Invalid days to cancel");
        
        uint256 totalDays = (bookingCheckOutDate[bookingId] - bookingCheckInDate[bookingId]) / 1 days;
        require(daysToCancel < totalDays, "ARoom: Cannot cancel entire booking");
        
        // Store old dates
        uint256 oldCheckInDate = bookingCheckInDate[bookingId];
        uint256 oldCheckOutDate = bookingCheckOutDate[bookingId];
        
        // Calculate amounts
        uint256 cancelledAmount = baseRoomPrice * daysToCancel;
        uint256 refundAmount = (cancelledAmount * cancellationRefundPercentage) / 100;
        
        // Update booking
        bookingCheckOutDate[bookingId] = oldCheckOutDate - (daysToCancel * 1 days);
        bookingTotalAmount[bookingId] = bookingTotalAmount[bookingId] - cancelledAmount;
        bookingDepositAmount[bookingId] = (bookingTotalAmount[bookingId] * depositPercentage) / 100;
        
        // Reset approval status
        bookingIsApproved[bookingId] = false;
        bookingOwnerApprovalMessage[bookingId] = "";
        bookingEntryPassword[bookingId] = "";
        bookingPasswordRevealed[bookingId] = false;
        bookingApprovalTimestamp[bookingId] = 0;
        bookingPasswordGeneratedTimestamp[bookingId] = 0;
        
        // Update date tracking
        removeBookingFromDates(bookingId, oldCheckInDate, oldCheckOutDate);
        addBookingToDates(bookingId, bookingCheckInDate[bookingId], bookingCheckOutDate[bookingId]);
        
        // Process refund
        if (bookingIsPaid[bookingId] && refundAmount > 0) {
            require(
                paymentToken.transfer(msg.sender, refundAmount),
                "ARoom: Partial refund failed"
            );
        }
        
        emit BookingCancelled(bookingId, msg.sender, refundAmount, "Partial cancellation");
    }

    // ============ DATE MANAGEMENT FUNCTIONS ============
    
    function areDatesBlocked(uint256 checkInDate, uint256 checkOutDate) internal view returns (bool) {
        for (uint256 date = checkInDate; date < checkOutDate; date += 1 days) {
            if (dateBlocked[date]) {
                return true;
            }
        }
        return false;
    }
    
    function blockDates(uint256 checkInDate, uint256 checkOutDate) internal {
        for (uint256 date = checkInDate; date < checkOutDate; date += 1 days) {
            dateBlocked[date] = true;
        }
    }
    
    function unblockDates(uint256 checkInDate, uint256 checkOutDate) internal {
        for (uint256 date = checkInDate; date < checkOutDate; date += 1 days) {
            dateBlocked[date] = false;
        }
    }
    
    /**
     * @dev Efficiently adds a booking to date tracking using mapping approach
     * @param bookingId The ID of the booking to add
     * @param checkInDate The check-in date (timestamp)
     * @param checkOutDate The check-out date (timestamp)
     * 
     * This function prevents stack overflow by using a simple mapping instead of nested loops
     */
    function addBookingToDates(uint256 bookingId, uint256 checkInDate, uint256 checkOutDate) internal {
        for (uint256 date = checkInDate; date < checkOutDate; date += 1 days) {
            bookingDateMap[date][bookingId] = true;
        }
    }
    
    /**
     * @dev Efficiently removes a booking from date tracking using mapping approach
     * @param bookingId The ID of the booking to remove
     * @param checkInDate The check-in date (timestamp)
     * @param checkOutDate The check-out date (timestamp)
     * 
     * This function prevents stack overflow by using a simple mapping instead of nested loops
     */
    function removeBookingFromDates(uint256 bookingId, uint256 checkInDate, uint256 checkOutDate) internal {
        for (uint256 date = checkInDate; date < checkOutDate; date += 1 days) {
            delete bookingDateMap[date][bookingId];
        }
    }


} 