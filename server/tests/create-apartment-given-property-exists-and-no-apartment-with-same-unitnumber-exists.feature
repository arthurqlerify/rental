Feature: Create Apartment

  Scenario: Given the specified property exists and no apartment with the same unitNumber exists under that property, and floorAreaSqm and bedrooms are positive values, When the PropertyMgr submits Create Apartment with propertyId, unitNumber, floorAreaSqm, bedrooms and a valid initial status (Occupied, Vacant or Ready), Then Apartment Created is recorded with a new apartmentId linked to the property and the apartment is available for leasing and turnover workflows.
    Given the specified property exists and no apartment with the same unitNumber exists under that property, and floorAreaSqm and bedrooms are positive values
    When the PropertyMgr submits Create Apartment with propertyId, unitNumber, floorAreaSqm, bedrooms and a valid initial status (Occupied, Vacant or Ready)
    Then Apartment Created is recorded with a new apartmentId linked to the property and the apartment is available for leasing and turnover workflows.