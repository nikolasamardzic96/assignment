const ContractStatus = {
    NEW: 'new',
    IN_PROGRESS: 'in_progress',
    TERMINATED: 'terminated'
};

const ProfileType = {
    CLIENT: "client",
    CONTRACTOR: "contractor"
}

Object.freeze(ContractStatus);
Object.freeze(ProfileType);

module.exports = { ContractStatus, ProfileType };