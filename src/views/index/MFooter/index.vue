<!--首页底部信息-->
<template>
  <div class="m-footer">
    <div class="firstLine">
      <span class="title">{{ $t('homepage.footer.title') }}</span>
      <span class="titleContent">{{ $t('homepage.footer.titleContent') }}</span>
    </div>
    <div class="secondLine">
      <span class="concat">{{ $t('homepage.footer.concat') }}</span>
      <span class="telephone">{{ $t('homepage.footer.telephone') }}</span>
      <span class="email">{{ $t('homepage.footer.email') }}</span>
    </div>
    <div class="thirdLine">
      <span class="copyright">{{ $t('homepage.footer.copyright') }}</span>
      <span class="company">{{ $t('homepage.footer.company') }}</span>
    </div>
    <div class="fourthLine">
      <span class="number1">{{ $t('homepage.footer.number1') }}</span>
      <span class="number2">{{ $t('homepage.footer.number2') }}</span>
    </div>
    <div class="erweima">
      <img src="../../../assets/images/index/erweima.jpg" alt="">
    </div>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss" scoped>
$p: 4/3;
.m-footer {
  width: 100%;
  background-color: #f2f2f2;
  text-align: center;
  overflow: hidden;
  position: relative;
  height: 150px;
  .firstLine {
	margin-top: 2%;
	.titleContent {
      margin-left: 0.5;
	}
  }
  .secondLine {
    margin-top: 0.3%;
	.telephone {
      margin-left: 0.5%;
	}
	.email {
      margin-left: 1.5%;
	}
  }
  .thirdLine, .fourthLine {
    font-family: 'simsun';
	font-size: 12px;
  }
  .thirdLine {
    margin-top: 0.3%;
	.company {
      margin-left: 0.5%;
	}
  }
  .fourthLine {
    margin-top: 0.3%;
	.number2 {
      margin-left: 1%;
	}
  }
  .erweima {
    position: absolute;
	right: 7%;
	top: 50%;
	transform: translateY(-50%);
  }
}
</style>
