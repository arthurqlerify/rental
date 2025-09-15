Feature: Create Lease

  Scenario: Given a specific apartment is available for leasing (status is 'Vacant' or 'Ready') and the PropertyMgr provides tenant details, lease start date, end date, and rent amount, When the PropertyMgr submits Create Lease, Then Lease Created is recorded with a new leaseId for the apartment and tenant, and the apartment's status changes to 'Occupied'.