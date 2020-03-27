<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="java.io.PrintWriter" %>
<%@ page import="member.MemberDAO" %>
<jsp:useBean id="member" class="member.Member" scope="page" />
	<!-- Navigation -->
	
	<%
		String e_mail = null;
		if (session.getAttribute("e_mail") != null) {
			e_mail = (String) session.getAttribute("e_mail");
		}
	%>
	<%
		if(e_mail == null) {
	%>
      <div class="row">
        <div class="col-md-4"></div>
        <div class="col-md-4" style="text-align:center;">
          <a href="./main_customer.jsp"><img src="../image/로고.png" alt="싸투리마켓 로고"></a>
        </div>
        <div class="col-md-4" style="text-align:right; padding-right:315px; padding-top:25px;">
        <a href="../login.jsp" class="nav_direct">로그인</a><span class="logo_span">|</span>
        <a href="../join.jsp" class="nav_direct">회원가입</a><span class="logo_span">|</span>
        <a href="#" class="nav_direct">고객센터</a>
       </div>
     </div>
     <%
		} else {
     %>
      <div class="row">
        <div class="col-md-4"></div>
        <div class="col-md-4" style="text-align:center;">
          <a href="./main_customer.jsp"><img src="../image/로고.png" alt="싸투리마켓 로고"></a>
        </div>
        <div class="col-md-4" style="text-align:right; padding-right:315px; padding-top:25px;">
        <a href="../logoutAction.jsp" class="nav_direct">로그아웃</a><span class="logo_span">|</span>
        <a href="#" class="nav_direct">고객센터</a>
       </div>
     </div>
	<%
		}
	%>
	<div class="wrap">
      <div class="top_bar">
        <select id="local" name="local">
          <option value="신부동" selected>생산지역 모두보기</option>
          <option value="신부동">신부동</option>
          <option value="신부동">두정동</option>
          <option value="신부동">청수동</option>
          <option value="신부동">불당동</option>
        </select>
        <input type="button" class="top_bar_btn" value="인기상품">
        <input type="button" class="top_bar_btn" value="이벤트">
        <input type="button" class="top_bar_btn" value="고객센터">
      </div>
      <div>
        <form class="search_form" action="index.html" method="post" style="width:310px;">
          <input type="submit" name="" value="" class="search_button">
          <input type="text" name="" placeholder="생산지역,상품검색" class="search_input">
        </form>
      </div>
      <div>
      	<a href="./mypage_customer.jsp"><img src="../image/마이페이지.png"></a>
      	<a href="./basket_customer.jsp"><img src="../image/장바구니.png"></a>
      </div>
    </div>


    