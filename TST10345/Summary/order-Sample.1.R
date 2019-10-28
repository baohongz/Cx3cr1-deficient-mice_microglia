args <- commandArgs(trailingOnly = TRUE)

if ( length(args) < 1) {
    print (paste0("Rscript ","order-Sample.R"," <sample annotation file"))
    q(save = "no")
}

sample <- read.table(args[1],header=TRUE,sep="\t",check.names=FALSE)

# order by pre-defined factor levels
sample$Age <- ordered(sample$Age, c("2m","1y","2y"))
sample$Genotype <- ordered(sample$Genotype, c("WT","Het","KO"))
sample$Sex <- ordered(sample$Sex, c("F","M"))

sample1 = sample[with(sample, order(Age, Genotype, Sex, Sample_ID )),]

write.table(x = sample1, file = "", quote = FALSE, sep = "\t", row.names = FALSE)
