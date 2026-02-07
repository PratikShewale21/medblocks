from services.blockchain import (
    grant_access,
    has_access,
    add_record,
    get_all_records
)


# 🔴 REPLACE with REAL Sepolia addresses
PATIENT = "0x5c8D0BaA491FaE50d95ded994b2E646a6CE2AB9d"
DOCTOR  = "0xe153678FBd37025462722C49e516AD6e1D248862"


def main():

    try:
        print("=== MEDBLOCKS Blockchain Test ===\n")

        # 1. Grant Access
        print("Granting access...")
        tx1 = grant_access(PATIENT, DOCTOR)
        print("TX Hash:", tx1)

        # 2. Check Access
        print("\nChecking access...")
        access = has_access(PATIENT, DOCTOR)
        print("Has access:", access)

        # 3. Add Record
        print("\nAdding record...")
        tx2 = add_record(
            PATIENT,
            "QmTestCID123456789",
            "test_report"
        )
        print("TX Hash:", tx2)

        # 4. Fetch Records
        print("\nFetching records...")
        records = get_all_records(PATIENT)

        if not records:
            print("No records found")
        else:
            for i, r in enumerate(records, 1):
                print(f"{i}.", r)

        print("\n✅ Blockchain test completed successfully")

    except Exception as e:
        print("\n❌ Test failed:")
        print(str(e))


if __name__ == "__main__":
    main()
