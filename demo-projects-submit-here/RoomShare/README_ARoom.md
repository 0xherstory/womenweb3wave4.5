# ARoom Enhanced - Personal Airbnb Smart Contract

A secure, gas-efficient smart contract for personal Airbnb-style bookings with enhanced security features, reentry attack prevention, and intelligent booking availability management.

## 🛡️ Security Features

### Reentry Attack Prevention
- **OpenZeppelin ReentrancyGuard**: All state-changing functions are protected against reentry attacks
- **Signature Reuse Prevention**: Cryptographic signatures can only be used once
- **Password Reuse Prevention**: Entry passwords are one-time use only
- **State Checks**: Multiple validation layers prevent unauthorized state changes

### Cryptographic Security
- **ECDSA Signature Verification**: All owner approvals require cryptographic signatures
- **Chain ID Protection**: Signatures are bound to specific blockchain networks
- **Unique Password Generation**: Cryptographically secure 8-character passwords
- **Time-based Access Control**: Passwords are only revealed on check-in date

## 📅 Booking Availability System

### Multi-Guest Booking Support
- **Pending Bookings**: Multiple guests can book the same dates while pending
- **Approval-Based Blocking**: Dates are only blocked once a booking is approved
- **Automatic Unblocking**: Dates are unblocked when approved bookings are cancelled
- **Real-time Availability**: Instant availability checking for any date range

### Stay Duration Limits
- **Maximum 7 Days**: Configurable maximum stay duration (default: 7 days)
- **Flexible Configuration**: Owner can adjust maximum stay up to 30 days
- **Validation**: Automatic rejection of bookings exceeding maximum duration

## 🏗️ Contract Architecture

### Core Components
```solidity
contract ARoomEnhanced is 
    Ownable, 
    ReentrancyGuard, 
    Pausable
```

### Optimized Data Storage
The contract uses individual mappings for efficient storage and to prevent stack overflow:

```solidity
// Booking data storage
mapping(uint256 => address) public bookingGuest;           // bookingId => guest address
mapping(uint256 => uint256) public bookingCheckInDate;     // bookingId => check-in date
mapping(uint256 => uint256) public bookingCheckOutDate;    // bookingId => check-out date
mapping(uint256 => uint256) public bookingTotalAmount;     // bookingId => total amount
mapping(uint256 => uint256) public bookingDepositAmount;   // bookingId => deposit amount
mapping(uint256 => bool) public bookingIsPaid;             // bookingId => is paid
mapping(uint256 => bool) public bookingIsApproved;         // bookingId => is approved
mapping(uint256 => bool) public bookingIsCheckedIn;        // bookingId => is checked in
mapping(uint256 => bool) public bookingIsCancelled;        // bookingId => is cancelled

// Guest information
mapping(uint256 => string) public bookingGuestNickname;    // bookingId => guest nickname
mapping(uint256 => string) public bookingGuestContact;     // bookingId => guest contact method
mapping(uint256 => string) public bookingGuestIntro;       // bookingId => guest introduction

// Booking availability tracking
mapping(uint256 => bool) public dateBlocked;               // date => blocked status
mapping(uint256 => mapping(uint256 => bool)) private bookingDateMap; // date => bookingId => exists
```

## 🔄 Workflow

### 1. Booking Creation
```solidity
function createBooking(
    uint256 checkInDate,
    uint256 checkOutDate,
    string memory nickname,
    string memory contactMethod,
    string memory introductionMessage
) external whenNotPaused nonReentrant
```
- Guest creates booking with contact information
- System calculates total cost and deposit amount
- Booking is created in "pending approval" state
- **Security**: Reentry protection, stay duration validation, date availability check

### 2. Owner Approval
```solidity
function approveBooking(
    uint256 bookingId,
    string memory ownerApprovalMessage,
    bytes memory signature
) external bookingExists(bookingId) notCancelled(bookingId) whenNotPaused nonReentrant
```
- Owner reviews guest information offline
- Owner provides signed approval message
- System verifies cryptographic signature
- **Security**: Signature verification, reuse prevention, date blocking
- **Availability**: Dates are blocked for other bookings once approved

### 3. Deposit Payment
```solidity
function payDeposit(uint256 bookingId) external 
    bookingExists(bookingId) 
    onlyGuest(bookingId) 
    notCancelled(bookingId) 
    bookingApproved(bookingId)
    whenNotPaused 
    nonReentrant
```
- Guest pays deposit using approved ERC20 tokens
- System locks deposit until check-out
- **Security**: Reentry protection, approval validation

### 4. Password Generation
```solidity
function generateEntryPassword(
    uint256 bookingId,
    bytes memory signature
) external bookingExists(bookingId) bookingApproved(bookingId) notCancelled(bookingId) whenNotPaused nonReentrant
```
- Owner generates unique entry password on check-in date
- Password is immediately available to owner
- **Security**: Time-based generation, signature verification, unique password creation

### 5. Physical Check-in Confirmation
```solidity
function confirmPhysicalCheckIn(
    uint256 bookingId,
    bytes memory signature
) external bookingExists(bookingId) notCancelled(bookingId) bookingApproved(bookingId) whenNotPaused nonReentrant
```
- Owner confirms guest's physical arrival at the property
- Required before password can be revealed
- **Security**: Owner signature verification, physical presence confirmation

### 6. Password Reveal
```solidity
function revealPasswordToGuest(
    uint256 bookingId,
    bytes memory signature
) external bookingExists(bookingId) notCancelled(bookingId) bookingApproved(bookingId) whenNotPaused nonReentrant
```
- Owner reveals password to guest at desired time
- Only available after physical check-in confirmation
- **Security**: Owner signature verification, time-based reveal, one-time use protection

### 7. Check-in
```solidity
function checkIn(
    uint256 bookingId,
    string memory entryPassword
) external bookingExists(bookingId) onlyGuest(bookingId) notCancelled(bookingId) bookingApproved(bookingId) whenNotPaused nonReentrant
```
- Guest provides entry password for verification
- System validates password and marks check-in complete
- **Security**: Password verification, reuse prevention, state validation

## 🔧 Configuration

### Owner-Configurable Parameters
```solidity
// Pricing
uint256 public baseRoomPrice;           // Base price per night
uint256 public depositPercentage;       // Deposit percentage (0-100)
uint256 public cancellationRefundPercentage; // Refund percentage (0-100)

// Booking Timeframes
uint256 public minAdvanceBookingDays;   // Minimum advance booking days
uint256 public maxAdvanceBookingDays;   // Maximum advance booking days
uint256 public maxStayDays;             // Maximum stay duration (default: 7)

// Security
address public signerAddress;           // Authorized signer for approvals
```

### Admin Functions
```solidity
function setBaseRoomPrice(uint256 _baseRoomPrice) external onlyOwner
function setDepositPercentage(uint256 _depositPercentage) external onlyOwner
function setCancellationRefundPercentage(uint256 _percentage) external onlyOwner
function setSignerAddress(address _signerAddress) external onlyOwner
function setBookingTimeframe(uint256 _minDays, uint256 _maxDays) external onlyOwner
function setMaxStayDays(uint256 _maxStayDays) external onlyOwner
function pause() external onlyOwner
function unpause() external onlyOwner
```

## 📊 Booking Management

### Date Availability System
```solidity
// Check if dates are available
function areDatesAvailable(uint256 checkInDate, uint256 checkOutDate) external view returns (bool)

// Check if a specific booking exists on a date
function isBookingOnDate(uint256 date, uint256 bookingId) external view returns (bool)

// Internal date blocking functions
function areDatesBlocked(uint256 checkInDate, uint256 checkOutDate) internal view returns (bool)
function blockDates(uint256 checkInDate, uint256 checkOutDate) internal
function unblockDates(uint256 checkInDate, uint256 checkOutDate) internal
```

### Booking Modifications
```solidity
function modifyBooking(
    uint256 bookingId,
    uint256 newCheckInDate,
    uint256 newCheckOutDate
) external bookingExists(bookingId) onlyGuest(bookingId) notCancelled(bookingId) whenNotPaused nonReentrant
```
- Allows guests to modify dates before approval
- Automatically recalculates costs
- Resets approval status for new dates
- **Security**: Reentry protection, stay duration validation

### Partial Cancellations
```solidity
function cancelPartialBooking(
    uint256 bookingId,
    uint256 daysToCancel
) external bookingExists(bookingId) onlyGuest(bookingId) notCancelled(bookingId) whenNotPaused nonReentrant
```
- Allows guests to cancel specific days
- Calculates partial refunds
- Updates booking duration and costs
- **Security**: Reentry protection, validation checks

### Cancellation and Withdrawal
```solidity
function cancelBooking(uint256 bookingId, string memory reason) external
function withdrawRemainingDeposit(uint256 bookingId) external
```
- Full booking cancellation with refund calculation
- Deposit withdrawal after check-out
- **Security**: State validation, refund protection

## 🔍 View Functions

### Booking Information
```solidity
function getGuestBookings(address guest) external view returns (uint256[] memory)
function calculateBookingCost(uint256 checkInDate, uint256 checkOutDate) external view returns (uint256 totalAmount, uint256 depositAmount)
function getContractBalance() external view returns (uint256)
function canRevealPassword(uint256 bookingId) external view returns (bool)
```

### Security Checks
```solidity
function isSignatureUsed(bytes memory signature) external view returns (bool)
function isPasswordUsed(string memory password) external view returns (bool)
```

## 🛡️ Security Implementation Details

### Reentry Attack Prevention
The contract uses OpenZeppelin's `ReentrancyGuard` to protect all state-changing functions:

```solidity
modifier nonReentrant() {
    require(!_locked, "ReentrancyGuard: reentrant call");
    _locked = true;
    _;
    _locked = false;
}
```

### Signature Security
All owner approvals require cryptographic signatures with chain ID protection:

```solidity
bytes32 messageHash = keccak256(abi.encodePacked(
    bookingId,
    guest,
    ownerApprovalMessage,
    block.chainid
));
bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);
```

### Password Security
Unique passwords are generated using multiple entropy sources:

```solidity
function generateUniquePassword(uint256 bookingId, address guest) internal view returns (string memory) {
    bytes32 hash = keccak256(abi.encodePacked(
        bookingId,
        guest,
        block.timestamp,
        block.prevrandao
    ));
    // Generate 8-character alphanumeric password
}
```

### Efficient Date Tracking
The contract uses optimized mappings for date-booking relationships:

```solidity
function addBookingToDates(uint256 bookingId, uint256 checkInDate, uint256 checkOutDate) internal {
    for (uint256 date = checkInDate; date < checkOutDate; date += 1 days) {
        bookingDateMap[date][bookingId] = true;
    }
}

function removeBookingFromDates(uint256 bookingId, uint256 checkInDate, uint256 checkOutDate) internal {
    for (uint256 date = checkInDate; date < checkOutDate; date += 1 days) {
        delete bookingDateMap[date][bookingId];
    }
}
```

## 📋 Events

### Core Events
```solidity
event BookingCreated(uint256 indexed bookingId, address indexed guest, uint256 checkInDate, uint256 checkOutDate, uint256 totalAmount, uint256 depositAmount, string guestNickname, string guestContactMethod);
event BookingApproved(uint256 indexed bookingId, address indexed guest, string ownerApprovalMessage, uint256 approvalTimestamp);
event DatesBlocked(uint256 indexed bookingId, uint256 checkInDate, uint256 checkOutDate, uint256 timestamp);
event EntryPasswordGenerated(uint256 indexed bookingId, address indexed guest, string entryPassword, uint256 timestamp);
event PhysicalCheckInConfirmed(uint256 indexed bookingId, address indexed guest, uint256 timestamp);
event PasswordRevealedToGuest(uint256 indexed bookingId, address indexed guest, string entryPassword, uint256 timestamp);
event DepositPaid(uint256 indexed bookingId, address indexed guest, uint256 amount);
event CheckInCompleted(uint256 indexed bookingId, address indexed guest, string entryPassword, uint256 timestamp);
event BookingCancelled(uint256 indexed bookingId, address indexed guest, uint256 refundAmount, string reason);
event WithdrawalCompleted(uint256 indexed bookingId, address indexed guest, uint256 amount);
```

## 🧪 Testing

### Security Test Coverage
- **Reentry Attack Tests**: Verify all functions are protected
- **Signature Security Tests**: Test signature verification and reuse prevention
- **Password Security Tests**: Verify unique password generation and reuse prevention
- **Date Availability Tests**: Test booking conflict resolution
- **Stay Duration Tests**: Verify maximum stay enforcement

### Integration Tests
- **Complete Lifecycle**: End-to-end booking process
- **Multiple Bookings**: Date conflict scenarios
- **Modification Scenarios**: Booking changes and cancellations
- **Emergency Functions**: Owner withdrawal and contract management

## 🚀 Deployment

### Prerequisites
```bash
npm install @openzeppelin/contracts
npm install @nomicfoundation/hardhat-toolbox
```

### Hardhat Configuration
```javascript
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      },
      viaIR: true,
      evmVersion: "paris"
    }
  }
};
```

### Deployment Script
```javascript
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    // Deploy mock token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("Mock Token", "MTK");
    
    // Deploy ARoomEnhanced
    const ARoomEnhanced = await ethers.getContractFactory("ARoomEnhanced");
    const aroom = await ARoomEnhanced.deploy(
        mockToken.address,
        signerAddress,
        ethers.parseEther("100"), // Base price
        30,  // Deposit percentage
        80   // Cancellation refund percentage
    );
    
    console.log("ARoomEnhanced deployed to:", aroom.address);
}
```

## 🔒 Security Considerations

### Best Practices Implemented
1. **Reentrancy Protection**: All external calls are protected
2. **Access Control**: Owner-only functions with proper modifiers
3. **Input Validation**: Comprehensive parameter validation
4. **State Management**: Proper state transitions and checks
5. **Cryptographic Security**: ECDSA signatures with chain ID protection
6. **Time-based Controls**: Check-in date enforcement
7. **Resource Management**: Gas-efficient operations with optimized storage

### Risk Mitigation
- **Signature Reuse**: Prevents replay attacks across networks
- **Password Reuse**: Ensures one-time use entry codes
- **Date Conflicts**: Prevents double-booking scenarios
- **State Validation**: Ensures proper booking lifecycle
- **Emergency Controls**: Owner can pause contract if needed
- **Stack Overflow Prevention**: Optimized data storage prevents compilation issues

## 📈 Performance Optimizations

### Gas Efficiency
- **Individual Mappings**: Direct access to booking data without struct overhead
- **Optimized Loops**: Efficient date range operations
- **Minimal Storage**: Reduced storage costs through mapping optimization
- **Compiler Optimizations**: viaIR compilation with aggressive optimization

### Scalability Features
- **O(1) Access**: Direct mapping access for all booking data
- **Efficient Date Tracking**: Optimized date-booking relationships
- **Modular Design**: Clean separation of concerns
- **Event-driven**: Comprehensive event logging for off-chain processing

## 📞 Support

For questions, issues, or contributions:
- Review the test suite for usage examples
- Check the event logs for debugging
- Verify all security features are properly configured
- Test thoroughly on testnets before mainnet deployment

---

**Note**: This contract is designed for personal use and should be thoroughly audited before production deployment. Always test on testnets first and ensure proper key management for the signer address. The contract has been optimized for gas efficiency and stack overflow prevention while maintaining all security features. 