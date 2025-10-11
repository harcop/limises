/**
 * Centralized ID generation utility
 * Provides consistent ID generation patterns across the application
 */

export class IdGenerator {
  /**
   * Generate a random string of specified length
   * @param length - Length of the random string
   * @returns Random string
   */
  private static generateRandomString(length: number): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  /**
   * Generate employee ID
   * Format: EMP{timestamp}{4-char-random}
   */
  static generateEmployeeId(): string {
    return `EMP${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate leave request ID
   * Format: LEAVE{timestamp}{4-char-random}
   */
  static generateLeaveId(): string {
    return `LEAVE${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate performance review ID
   * Format: REVIEW{timestamp}{4-char-random}
   */
  static generateReviewId(): string {
    return `REVIEW${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate training record ID
   * Format: TRAIN{timestamp}{4-char-random}
   */
  static generateTrainingId(): string {
    return `TRAIN${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate clinical note ID
   * Format: CN-{timestamp}-{9-char-random}
   */
  static generateClinicalNoteId(): string {
    return `CN-${Date.now()}-${this.generateRandomString(9)}`;
  }

  /**
   * Generate prescription ID
   * Format: RX-{timestamp}-{9-char-random}
   */
  static generatePrescriptionId(): string {
    return `RX-${Date.now()}-${this.generateRandomString(9)}`;
  }

  /**
   * Generate radiology order ID
   * Format: RAD{timestamp}{4-char-random}
   */
  static generateRadiologyOrderId(): string {
    return `RAD${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate study ID
   * Format: STUDY{timestamp}{4-char-random}
   */
  static generateStudyId(): string {
    return `STUDY${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate equipment ID
   * Format: EQ{timestamp}{4-char-random}
   */
  static generateEquipmentId(): string {
    return `EQ${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate integration ID
   * Format: INT{timestamp}{4-char-random}
   */
  static generateIntegrationId(): string {
    return `INT${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate audit ID
   * Format: AUDIT{timestamp}{4-char-random}
   */
  static generateAuditId(): string {
    return `AUDIT${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate operation theatre ID
   * Format: OT{timestamp}{4-char-random}
   */
  static generateTheatreId(): string {
    return `OT${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate procedure ID
   * Format: PROC{timestamp}{4-char-random}
   */
  static generateProcedureId(): string {
    return `PROC${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate schedule ID
   * Format: SCHED{timestamp}{4-char-random}
   */
  static generateScheduleId(): string {
    return `SCHED${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate assignment ID
   * Format: ASSIGN{timestamp}{4-char-random}
   */
  static generateAssignmentId(): string {
    return `ASSIGN${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate consumption ID
   * Format: CONS{timestamp}{4-char-random}
   */
  static generateConsumptionId(): string {
    return `CONS${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate emergency visit ID
   * Format: EMG{timestamp}{4-char-random}
   */
  static generateEmergencyVisitId(): string {
    return `EMG${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate ambulance service ID
   * Format: AMB{timestamp}{4-char-random}
   */
  static generateAmbulanceServiceId(): string {
    return `AMB${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate emergency call ID
   * Format: CALL{timestamp}{4-char-random}
   */
  static generateEmergencyCallId(): string {
    return `CALL${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate ward ID
   * Format: WARD{timestamp}{4-char-random}
   */
  static generateWardId(): string {
    return `WARD${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate bed ID
   * Format: BED{timestamp}{4-char-random}
   */
  static generateBedId(): string {
    return `BED${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate admission ID
   * Format: ADM{timestamp}{4-char-random}
   */
  static generateAdmissionId(): string {
    return `ADM${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate OPD visit ID
   * Format: OPD{timestamp}{4-char-random}
   */
  static generateOPDVisitId(): string {
    return `OPD${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate queue ID
   * Format: Q{timestamp}{4-char-random}
   */
  static generateQueueId(): string {
    return `Q${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate appointment ID
   * Format: APPT{timestamp}{4-char-random}
   */
  static generateAppointmentId(): string {
    return `APPT${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate patient ID
   * Format: PAT{timestamp}{4-char-random}
   */
  static generatePatientId(): string {
    return `PAT${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate staff ID
   * Format: STAFF{timestamp}{4-char-random}
   */
  static generateStaffId(): string {
    return `STAFF${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate billing account ID
   * Format: BILL{timestamp}{4-char-random}
   */
  static generateBillingAccountId(): string {
    return `BILL${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate charge ID
   * Format: CHG{timestamp}{4-char-random}
   */
  static generateChargeId(): string {
    return `CHG${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate payment ID
   * Format: PAY{timestamp}{4-char-random}
   */
  static generatePaymentId(): string {
    return `PAY${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate lab order ID
   * Format: LAB{timestamp}{4-char-random}
   */
  static generateLabOrderId(): string {
    return `LAB${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate lab sample ID
   * Format: SAMPLE{timestamp}{4-char-random}
   */
  static generateLabSampleId(): string {
    return `SAMPLE${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate lab result ID
   * Format: RESULT{timestamp}{4-char-random}
   */
  static generateLabResultId(): string {
    return `RESULT${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate drug ID
   * Format: DRUG{timestamp}{4-char-random}
   */
  static generateDrugId(): string {
    return `DRUG${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate inventory item ID
   * Format: INV{timestamp}{4-char-random}
   */
  static generateInventoryItemId(): string {
    return `INV${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate inventory transaction ID
   * Format: TRANS{timestamp}{4-char-random}
   */
  static generateInventoryTransactionId(): string {
    return `TRANS${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate purchase order ID
   * Format: PO{timestamp}{4-char-random}
   */
  static generatePurchaseOrderId(): string {
    return `PO${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate dispense ID
   * Format: DISP{timestamp}{4-char-random}
   */
  static generateDispenseId(): string {
    return `DISP${Date.now()}${this.generateRandomString(4).toUpperCase()}`;
  }

  /**
   * Generate a generic ID with custom prefix
   * @param prefix - Custom prefix for the ID
   * @param length - Length of random string (default: 4)
   * @returns Generated ID
   */
  static generateCustomId(prefix: string, length: number = 4): string {
    return `${prefix}${Date.now()}${this.generateRandomString(length).toUpperCase()}`;
  }
}
