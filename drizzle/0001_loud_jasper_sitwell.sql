CREATE TABLE `collaterals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`userId` int,
	`type` varchar(40) NOT NULL,
	`details` text,
	`estimatedValue` int,
	`referenceNumber` varchar(120),
	`status` enum('pending','verified','rejected','released') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collaterals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phone` varchar(32),
	`address` text,
	`occupation` varchar(160),
	`monthlyIncome` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`loanId` int,
	`fileName` varchar(255) NOT NULL,
	`documentType` varchar(80) NOT NULL DEFAULT 'loan document',
	`mimeType` varchar(120) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`verificationStatus` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loan_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`applicationNumber` varchar(40) NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`mobile` varchar(32) NOT NULL,
	`email` varchar(320) NOT NULL,
	`address` text NOT NULL,
	`occupation` varchar(160) NOT NULL,
	`monthlyIncome` int NOT NULL,
	`loanType` varchar(32) NOT NULL,
	`requiredAmount` int NOT NULL,
	`purpose` text NOT NULL,
	`repaymentFrequency` varchar(16) NOT NULL,
	`preferredDuration` int NOT NULL,
	`collateralType` varchar(40) NOT NULL,
	`collateralDetails` text,
	`estimatedValue` int,
	`referenceNumber` varchar(120),
	`status` enum('draft','submitted','under_review','documents_required','approved','rejected') NOT NULL DEFAULT 'submitted',
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loan_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `loan_applications_applicationNumber_unique` UNIQUE(`applicationNumber`)
);
--> statement-breakpoint
CREATE TABLE `loans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`userId` int NOT NULL,
	`loanNumber` varchar(40) NOT NULL,
	`loanType` varchar(32) NOT NULL,
	`principalAmount` int NOT NULL,
	`interestRate` int NOT NULL,
	`termMonths` int NOT NULL,
	`repaymentFrequency` varchar(16) NOT NULL,
	`installmentAmount` int NOT NULL,
	`outstanding` int NOT NULL,
	`status` enum('approved','disbursed','active','overdue','completed','closed') NOT NULL DEFAULT 'active',
	`approvedAt` timestamp,
	`disbursedAt` timestamp,
	`nextDueDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loans_id` PRIMARY KEY(`id`),
	CONSTRAINT `loans_applicationId_unique` UNIQUE(`applicationId`),
	CONSTRAINT `loans_loanNumber_unique` UNIQUE(`loanNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loanId` int NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`method` varchar(24) NOT NULL,
	`reference` varchar(120),
	`status` enum('paid','pending','failed') NOT NULL DEFAULT 'paid',
	`paidAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
